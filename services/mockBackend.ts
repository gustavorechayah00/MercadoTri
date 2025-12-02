
import { Product, User, Category, Condition, UserRole, SiteSettings, AIProvider, ShopSummary } from "../types";
import { supabase } from "./supabaseClient";

/**
 * HELPER: Upload Base64 Image to Supabase Storage
 */
const uploadImageToSupabase = async (base64Data: string, bucket: string = 'product-images'): Promise<string> => {
  try {
    // 1. Convert Base64 to Blob
    const fetchRes = await fetch(base64Data);
    const blob = await fetchRes.blob();

    // 2. Generate unique filename
    // Detect extension from base64 header
    const extensionMatch = base64Data.match(/^data:image\/(\w+);base64,/);
    const fileExt = extensionMatch ? extensionMatch[1] : 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    // 3. Upload to bucket
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, blob);

    if (uploadError) throw uploadError;

    // 4. Get Public URL
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error(`Error uploading image to ${bucket}:`, error);
    throw error;
  }
};

/**
 * HELPER: Map Supabase DB Row to Frontend Product Type
 */
const mapRowToProduct = (row: any): Product => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  description: row.description,
  category: row.category as Category,
  brand: row.brand,
  condition: row.condition as Condition,
  price: row.price,
  currency: row.currency,
  imageUrls: row.image_urls || [],
  status: (row.status || 'published') as 'draft' | 'published' | 'sold',
  createdAt: new Date(row.created_at).getTime(),
  tags: row.tags || []
});

const mapRowToUser = (row: any): User => ({
  id: row.id,
  email: row.email || '',
  role: (row.role || 'buyer') as UserRole,
  name: row.name || row.email?.split('@')[0] || 'Usuario',
  whatsapp: row.whatsapp || '',
  phone: row.phone || '',
  avatarUrl: row.avatar_url || '',
  shopName: row.shop_name,
  shopImageUrl: row.shop_image_url
});

// Default settings in case DB fetch fails
const DEFAULT_SETTINGS: SiteSettings = {
    siteName: 'Mercado Tri',
    siteDescription: 'La plataforma líder para productos de triatlón.',
    defaultLanguage: 'es',
    aiProvider: 'gemini'
};

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("No user returned");

    // CRITICAL: Ensure Admin Profile exists on Login to pass RLS
    if (email === 'admin@triproducts.com') {
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: email,
          role: 'admin'
        }, { onConflict: 'id' }); 
      } catch (e) {
        console.warn("Could not upsert admin profile", e);
      }
      return { id: data.user.id, email: email, name: 'Admin', role: 'admin' };
    }

    // Fetch Profile
    try {
        const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
        if (profile) return mapRowToUser(profile);
        
        // If profile doesn't exist but auth does (rare inconsistency), treat as buyer
        if (profileError && profileError.code === 'PGRST116') {
             return {
              id: data.user.id,
              email: data.user.email || '',
              name: data.user.email?.split('@')[0] || 'User',
              role: 'buyer'
            };
        }
    } catch (e) {
        console.warn("Could not fetch profile", e);
    }

    return {
      id: data.user.id,
      email: data.user.email || '',
      name: data.user.email?.split('@')[0] || 'User',
      role: 'buyer'
    };
  },

  loginWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        scopes: 'email profile', // Explicitly request profile data
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });

    if (error) throw new Error(error.message);
    return data;
  },

  loginWithGithub: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin,
        scopes: 'read:user user:email', // CRITICAL: Fix for "Error getting user profile" when email is private
        queryParams: {
            prompt: 'consent', // Force re-consent to ensure permissions are applied
        }
      }
    });

    if (error) throw new Error(error.message);
    return data;
  },

  signUp: async (email: string, password: string, extraData: { name: string, whatsapp: string, phone: string }): Promise<User> => {
    // 1. Register in Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("Registration failed");

    const finalRole: UserRole = email === 'admin@triproducts.com' ? 'admin' : 'buyer';

    // 2. Update Profile with extra data using UPSERT to be safe
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: email,
          role: finalRole,
          name: extraData.name,
          whatsapp: extraData.whatsapp,
          phone: extraData.phone
        });
        
      if (profileError) console.error("Error creating profile:", profileError);
    } catch (e) {
      console.warn("Error inserting profile:", e);
    }

    return {
      id: data.user.id,
      email: data.user.email || '',
      role: finalRole,
      name: extraData.name,
      whatsapp: extraData.whatsapp,
      phone: extraData.phone
    };
  },

  updateProfile: async (userId: string, updates: Partial<User>, avatarBase64?: string): Promise<User> => {
    let avatarUrl = updates.avatarUrl;

    if (avatarBase64) {
      avatarUrl = await uploadImageToSupabase(avatarBase64, 'avatars');
    }

    const payload: any = {
      id: userId, // Required for upsert
      name: updates.name,
      whatsapp: updates.whatsapp,
      phone: updates.phone,
    };
    if (avatarUrl) payload.avatar_url = avatarUrl;
    if (updates.shopName) payload.shop_name = updates.shopName;

    // Use UPSERT instead of UPDATE to handle cases where profile might be missing
    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload) 
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapRowToUser(data);
  },
  
  createShop: async (userId: string, shopName: string, shopImageBase64?: string): Promise<User> => {
      let shopImageUrl = null;
      if (shopImageBase64) {
          shopImageUrl = await uploadImageToSupabase(shopImageBase64, 'avatars'); // Reuse avatars bucket or create a new 'shops' bucket
      }

      const updatePayload: any = { 
          shop_name: shopName,
          role: 'seller' // Upgrade role logic
      };
      if (shopImageUrl) {
          updatePayload.shop_image_url = shopImageUrl;
      }

      // 1. Update Profile with shop name AND force role to seller if currently buyer
      const { data, error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', userId)
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      return mapRowToUser(data);
  },

  getSessionUser: async (): Promise<User | null> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) return null;

      const email = session.user.email || '';
      const userId = session.user.id;

      // Special handling for hardcoded admin
      if (email === 'admin@triproducts.com') {
          return { id: userId, email: email, name: 'Admin', role: 'admin' };
      }

      // Try to get existing profile
      try {
          const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
          // OAUTH SYNC: If profile exists but name/avatar missing, OR profile is missing completely
          // We assume "User" or null name means we should try to sync from OAuth provider
          const metadata = session.user.user_metadata || {};
          const metaName = metadata.full_name || metadata.name || metadata.user_name;
          const metaAvatar = metadata.avatar_url || metadata.picture;

          const shouldUpsert = !profile || (metaName && (!profile.name || profile.name === 'Usuario'));

          if (shouldUpsert) {
              const newName = profile?.name && profile.name !== 'Usuario' ? profile.name : (metaName || email.split('@')[0]);
              const newAvatar = profile?.avatar_url || metaAvatar || '';
              const currentRole = profile?.role || 'buyer';

              const upsertData = {
                  id: userId,
                  email: email,
                  role: currentRole,
                  name: newName,
                  avatar_url: newAvatar,
                  // Preserve existing fields if updating
                  whatsapp: profile?.whatsapp || '',
                  phone: profile?.phone || '',
                  shop_name: profile?.shop_name,
                  shop_image_url: profile?.shop_image_url
              };

              // Silent update to ensure profile exists and has Google/Github data
              await supabase.from('profiles').upsert(upsertData);
              
              // Return combined object immediately
              return {
                  id: userId,
                  email: email,
                  role: currentRole as UserRole,
                  name: newName,
                  avatarUrl: newAvatar,
                  whatsapp: upsertData.whatsapp,
                  phone: upsertData.phone,
                  shopName: upsertData.shop_name,
                  shopImageUrl: upsertData.shop_image_url
              };
          }
          
          // If profile exists and is fine
          if (profile) return mapRowToUser(profile);

      } catch (e) {
          console.warn("Could not fetch/sync profile session", e);
      }

      // Fallback
      return {
        id: userId,
        email: email,
        name: email.split('@')[0],
        role: 'buyer'
      };
    } catch (e) {
      return null;
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
  }
};

export const adminService = {
  getAllUsers: async (): Promise<User[]> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(mapRowToUser);
    } catch (err) {
      console.error("Error fetching users:", err);
      throw err;
    }
  },

  updateUserRole: async (userId: string, newRole: UserRole): Promise<void> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw new Error(error.message);
    } catch (e) {
      console.error("Error updating user role:", e);
      throw e;
    }
  },

  updateUserProfile: async (userId: string, updates: Partial<User>): Promise<void> => {
    try {
        const { error } = await supabase
        .from('profiles')
        .update({
            name: updates.name,
            whatsapp: updates.whatsapp,
            phone: updates.phone,
            shop_name: updates.shopName
        })
        .eq('id', userId);

        if (error) throw new Error(error.message);
    } catch (e) {
        console.error("Error updating user profile by admin:", e);
        throw e;
    }
  },

  deleteUser: async (userId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw new Error(error.message);
    } catch (e) {
      console.error("Error deleting user profile:", e);
      throw e;
    }
  }
};

export const productService = {
  getAll: async (): Promise<Product[]> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
         if (error.code === '42P01') { 
             console.warn("Products table missing (42P01). Returning empty list.");
             return [];
         }
         throw error;
      }
      return data ? data.map(mapRowToProduct) : [];
    } catch (e) {
      console.error("Error fetching products:", JSON.stringify(e));
      return []; 
    }
  },
  
  getShopStats: async (userId: string): Promise<{ total: number, active: number, sold: number, revenue: number }> => {
      const { data, error } = await supabase
        .from('products')
        .select('id, status, price')
        .eq('user_id', userId);
        
      if (error || !data) return { total: 0, active: 0, sold: 0, revenue: 0 };
      
      const total = data.length;
      const active = data.filter(p => p.status === 'published').length;
      const sold = data.filter(p => p.status === 'sold').length;
      const revenue = data.filter(p => p.status === 'sold').reduce((sum, p) => sum + (p.price || 0), 0);
      
      return { total, active, sold, revenue };
  },

  getFeaturedShops: async (): Promise<ShopSummary[]> => {
      try {
        // 1. Fetch Sellers with Shops
        const { data: sellers, error: sellerError } = await supabase
          .from('profiles')
          .select('id, shop_name, shop_image_url')
          .not('shop_name', 'is', null);

        if (sellerError) throw sellerError;
        if (!sellers || sellers.length === 0) return [];

        // 2. Fetch Product Counts (Simple aggregation)
        // We get all published products to count them. In production, use RPC or .count() per seller.
        const { data: products } = await supabase
          .from('products')
          .select('user_id')
          .eq('status', 'published');
          
        const productMap: Record<string, number> = {};
        products?.forEach(p => {
            productMap[p.user_id] = (productMap[p.user_id] || 0) + 1;
        });

        // 3. Map to ShopSummary
        const shops: ShopSummary[] = sellers
            .map(s => ({
                id: s.id,
                name: s.shop_name,
                shopImageUrl: s.shop_image_url,
                productCount: productMap[s.id] || 0
            }))
            .filter(s => s.productCount > 0) // Only shops with products
            .sort((a, b) => b.productCount - a.productCount); // Most active first

        return shops;

      } catch (e) {
          console.error("Error fetching shops", e);
          return [];
      }
  },

  create: async (productData: Omit<Product, 'id' | 'createdAt' | 'userId'>): Promise<Product> => {
    const user = await authService.getSessionUser();
    if (!user) throw new Error("Debes iniciar sesión para publicar.");

    const finalImageUrls: string[] = [];
    for (const img of productData.imageUrls) {
      if (img.startsWith('data:')) {
        const url = await uploadImageToSupabase(img);
        finalImageUrls.push(url);
      } else {
        finalImageUrls.push(img);
      }
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        user_id: user.id,
        title: productData.title,
        description: productData.description,
        category: productData.category,
        brand: productData.brand,
        condition: productData.condition,
        price: productData.price,
        currency: productData.currency,
        image_urls: finalImageUrls,
        status: productData.status,
        tags: productData.tags
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapRowToProduct(data);
  },

  update: async (id: string, updates: Partial<Product>): Promise<Product> => {
    let finalImageUrls = updates.imageUrls;
    
    if (updates.imageUrls) {
      const processedUrls: string[] = [];
      for (const img of updates.imageUrls) {
        if (img.startsWith('data:')) {
          const url = await uploadImageToSupabase(img);
          processedUrls.push(url);
        } else {
          processedUrls.push(img);
        }
      }
      finalImageUrls = processedUrls;
    }

    const payload: any = {};
    if (updates.title) payload.title = updates.title;
    if (updates.description) payload.description = updates.description;
    if (updates.category) payload.category = updates.category;
    if (updates.brand) payload.brand = updates.brand;
    if (updates.condition) payload.condition = updates.condition;
    if (updates.price) payload.price = updates.price;
    if (updates.currency) payload.currency = updates.currency;
    if (finalImageUrls) payload.image_urls = finalImageUrls;
    if (updates.status) payload.status = updates.status;
    if (updates.tags) payload.tags = updates.tags;

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapRowToProduct(data);
  },

  delete: async (id: string) => {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw new Error(error.message);
    
    if (!data || data.length === 0) {
        const { count } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('id', id);
        if (count && count > 0) {
            throw new Error("No tienes permiso para eliminar este producto. (Bloqueo RLS)");
        }
    }
  },

  deleteMany: async (ids: string[]) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .delete()
        .in('id', ids)
        .select();
        
      if (error) throw new Error(error.message);

      if (!data || data.length === 0) {
         const { count } = await supabase.from('products').select('*', { count: 'exact', head: true }).in('id', ids);
         if (count && count > 0) {
            throw new Error("No tienes permiso para eliminar estos productos. (Bloqueo RLS)");
         }
      }
    } catch (e) {
      console.error("Error bulk deleting:", e);
      throw e;
    }
  }
};

export const configService = {
  getSettings: async (): Promise<SiteSettings> => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (error) {
        if (error.code === '42P01' || error.code === 'PGRST116') {
             return DEFAULT_SETTINGS;
        }
        console.error("Error fetching settings", JSON.stringify(error));
        return DEFAULT_SETTINGS;
    }
    
    return {
      siteName: data?.site_name || DEFAULT_SETTINGS.siteName,
      siteDescription: data?.site_description || DEFAULT_SETTINGS.siteDescription,
      logoUrl: data?.logo_url,
      defaultLanguage: data?.default_language || 'es',
      aiProvider: (data?.ai_provider as AIProvider) || 'gemini',
      geminiApiKey: data?.gemini_api_key || '',
      geminiModel: data?.gemini_model || 'gemini-2.5-flash',
      openaiApiKey: data?.openai_api_key || '',
      openaiModel: data?.openai_model || 'gpt-4o'
    };
  },

  updateSettings: async (settings: SiteSettings, logoBase64?: string): Promise<void> => {
    let logoUrl = settings.logoUrl;
    if (logoBase64) {
      logoUrl = await uploadImageToSupabase(logoBase64, 'product-images'); 
    }

    const { error } = await supabase
      .from('site_settings')
      .upsert({
        id: 1, 
        site_name: settings.siteName,
        site_description: settings.siteDescription,
        logo_url: logoUrl,
        default_language: settings.defaultLanguage,
        ai_provider: settings.aiProvider,
        gemini_api_key: settings.geminiApiKey,
        gemini_model: settings.geminiModel,
        openai_api_key: settings.openaiApiKey,
        openai_model: settings.openaiModel
      });

    if (error) throw new Error(error.message);
  }
};
