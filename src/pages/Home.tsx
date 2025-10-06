import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";
import { Skeleton } from "@/components/ui/skeleton";

const Home = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchProducts();
    if (session?.user) {
      fetchCartCount();
    }
  }, [session]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*, profiles(full_name), categories(name)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const fetchCartCount = async () => {
    if (!session?.user) return;

    const { count } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("buyer_id", session.user.id);

    setCartItemsCount(count || 0);
  };

  const handleAddToCart = async (productId: string) => {
    if (!session?.user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para agregar productos al carrito",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("cart_items").upsert(
      {
        buyer_id: session.user.id,
        product_id: productId,
        quantity: 1,
      },
      {
        onConflict: "buyer_id,product_id",
      }
    );

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito",
        variant: "destructive",
      });
    } else {
      toast({
        title: "¡Producto agregado!",
        description: "El producto se agregó a tu carrito",
      });
      fetchCartCount();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={session?.user} cartItemsCount={cartItemsCount} />

      <section className="relative bg-gradient-to-r from-primary to-secondary text-primary-foreground py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Compra y Vende con Confianza
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Miles de productos esperando por ti
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Productos Destacados</h2>
          <p className="text-muted-foreground">
            Descubre los mejores productos de nuestros vendedores
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={parseFloat(product.price)}
                image={product.images?.[0]}
                condition={product.condition}
                onAddToCart={() => handleAddToCart(product.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              No hay productos disponibles en este momento
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
