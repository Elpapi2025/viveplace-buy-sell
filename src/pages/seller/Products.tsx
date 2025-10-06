import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useNavigate, Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";

const SellerProducts = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) navigate("/auth/login");
      else fetchProducts(session.user.id);
    });
  }, []);

  const fetchProducts = async (userId: string) => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false });
    setProducts(data || []);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={session?.user} />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mis Productos</h1>
          <Button asChild>
            <Link to="/seller/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Producto
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              price={parseFloat(product.price)}
              image={product.images?.[0]}
              condition={product.condition}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default SellerProducts;
