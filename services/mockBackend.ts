
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
    if (base64Data.length < 2000000) return base64Data; 
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
  instagram: row.instagram || '',
  avatarUrl: row.avatar_url || '',
  shopName: row.shop_name,
  shopImageUrl: row.shop_image_url,
  shopDescription: row.shop_description
});

// Default settings
const DEFAULT_SETTINGS: SiteSettings = {
    siteName: 'Mercado Tri',
    siteDescription: 'La plataforma líder para productos de triatlón.',
    defaultLanguage: 'es',
    aiProvider: 'gemini'
};

// Fallback Mock Data
const MOCK_PRODUCTS: Product[] = []; // Empty default

const isNetworkError = (error: any) => {
  const msg = error?.message || '';
  if (typeof msg !== 'string') return false;
  return msg.includes('Failed to fetch') || msg.includes('Network request failed') || msg.includes('connection error');
};

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
            if (isNetworkError(error)) {
                 console.warn("Backend Unreachable.");
                 throw new Error("Error de conexión.");
            }
            throw new Error(error.message);
        }
        
        if (!data.user) throw new Error("No user returned");

        // Admin Override for demo
        if (email === 'admin@triproducts.com') {
          return { id: data.user.id, email: email, name: 'Admin', role: 'admin' };
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
        return profile ? mapRowToUser(profile) : {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.email?.split('@')[0] || 'User',
          role: 'buyer'
        };
    } catch (e: any) {
        throw e;
    }
  },

  loginWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) throw new Error(error.message);
    return data;
  },

  loginWithGithub: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin }
    });
    if (error) throw new Error(error.message);
    return data;
  },

  signUp: async (email: string, password: string, extraData: { name: string, whatsapp: string, phone: string }): Promise<User> => {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("Registration failed");

    const finalRole: UserRole = 'buyer'; // Default to buyer

    // Upsert profile
    await supabase.from('profiles').upsert({
        id: data.user.id,
        email: email,
        role: finalRole,
        name: extraData.name,
        whatsapp: extraData.whatsapp,
        phone: extraData.phone
    });

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
      name: updates.name,
      whatsapp: updates.whatsapp,
      phone: updates.phone,
      instagram: updates.instagram
    };
    if (avatarUrl) payload.avatar_url = avatarUrl;
    
    // Logic: If downgrading to Buyer from Seller
    if (updates.role === 'buyer') {
        payload.role = 'buyer';
        payload.shop_name = null;
        payload.shop_description = null;
        payload.shop_image_url = null;
        
        // CRITICAL: Delete products if shop is closed
        await productService.deleteAllFromUser(userId);
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(payload) 
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapRowToUser(data);
  },
  
  createShop: async (userId: string, shopName: string, shopImageBase64?: string, shopDescription?: string, contact?: { whatsapp: string, phone: string, instagram: string }): Promise<User> => {
      let shopImageUrl = null;
      if (shopImageBase64 && shopImageBase64.startsWith('data:')) {
          shopImageUrl = await uploadImageToSupabase(shopImageBase64, 'avatars');
      } else if (shopImageBase64) {
          shopImageUrl = shopImageBase64;
      }

      const updatePayload: any = { 
          shop_name: shopName,
          shop_description: shopDescription,
          role: 'seller',
          // Ensure contact info is synced
          whatsapp: contact?.whatsapp,
          phone: contact?.phone,
          instagram: contact?.instagram
      };
      if (shopImageUrl) {
          updatePayload.shop_image_url = shopImageUrl;
      }

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

      if (email === 'admin@triproducts.com') {
          return { id: userId, email: email, name: 'Admin', role: 'admin' };
      }

      const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
      // Sync metadata if profile doesn't exist
      if (!profile) {
           const metadata = session.user.user_metadata || {};
           const name = metadata.full_name || email.split('@')[0];
           await supabase.from('profiles').upsert({ id: userId, email, name, role: 'buyer' });
           return { id: userId, email, name, role: 'buyer' };
      }
      return mapRowToUser(profile);
    } catch (e) {
      return null;
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
  }
};

export const productService = {
  getAll: async (): Promise<Product[]> => {
    try {
      // By default return everything, frontend filters. 
      // Ideally backend filters status='published' but MyShop needs 'draft'.
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return MOCK_PRODUCTS;
      return data ? data.map(mapRowToProduct) : [];
    } catch (e) {
      return MOCK_PRODUCTS; 
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
        const { data: sellers } = await supabase
          .from('profiles')
          .select('id, shop_name, shop_image_url')
          .eq('role', 'seller')
          .not('shop_name', 'is', null);

        if (!sellers) return [];

        const { data: products } = await supabase
          .from('products')
          .select('user_id')
          .eq('status', 'published');
          
        const productMap: Record<string, number> = {};
        products?.forEach(p => {
            productMap[p.user_id] = (productMap[p.user_id] || 0) + 1;
        });

        const shops: ShopSummary[] = sellers
            .map(s => ({
                id: s.id,
                name: s.shop_name,
                shopImageUrl: s.shop_image_url,
                productCount: productMap[s.id] || 0
            }))
            .filter(s => s.productCount > 0)
            .sort((a, b) => b.productCount - a.productCount);

        return shops;

      } catch (e) {
          return [];
      }
  },

  getShopDetails: async (userId: string): Promise<User | null> => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (!data) return null;
      return mapRowToUser(data);
  },

  create: async (productData: Omit<Product, 'id' | 'createdAt' | 'userId'>): Promise<Product> => {
    const user = await authService.getSessionUser();
    if (!user) throw new Error("Debes iniciar sesión.");
    if (user.role === 'admin') throw new Error("Administradores no pueden vender.");
    if (user.role === 'buyer') throw new Error("Debes abrir una tienda para vender.");

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
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  deleteMany: async (ids: string[]) => {
      const { error } = await supabase.from('products').delete().in('id', ids);
      if (error) throw new Error(error.message);
  },

  deleteAllFromUser: async (userId: string) => {
      const { error } = await supabase.from('products').delete().eq('user_id', userId);
      if (error) console.error("Error deleting user products", error);
  },

  updateStatusMany: async (ids: string[], status: 'draft' | 'published') => {
      const { error } = await supabase.from('products').update({ status }).in('id', ids);
      if (error) throw new Error(error.message);
  }
};

export const configService = {
  getSettings: async (): Promise<SiteSettings> => {
    try {
        const { data } = await supabase.from('site_settings').select('*').eq('id', 1).single();
        if (!data) return DEFAULT_SETTINGS;
        
        return {
        siteName: data.site_name || DEFAULT_SETTINGS.siteName,
        siteDescription: data.site_description || DEFAULT_SETTINGS.siteDescription,
        logoUrl: data.logo_url,
        defaultLanguage: data.default_language || 'es',
        aiProvider: data.ai_provider || 'gemini',
        geminiApiKey: data.gemini_api_key,
        geminiModel: data.gemini_model,
        openaiApiKey: data.openai_api_key,
        openaiModel: data.openai_model
        };
    } catch (e) {
        return DEFAULT_SETTINGS;
    }
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
