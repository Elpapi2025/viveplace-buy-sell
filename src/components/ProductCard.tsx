import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image?: string;
  condition: "new" | "used";
  onAddToCart?: () => void;
}

export const ProductCard = ({
  id,
  title,
  price,
  image,
  condition,
  onAddToCart,
}: ProductCardProps) => {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-[var(--shadow-card)]">
      <Link to={`/products/${id}`}>
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={image || "/placeholder.svg"}
            alt={title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <Link to={`/products/${id}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-primary">
            ${price.toLocaleString()}
          </p>
          <Badge variant={condition === "new" ? "default" : "secondary"}>
            {condition === "new" ? "Nuevo" : "Usado"}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={(e) => {
            e.preventDefault();
            onAddToCart?.();
          }}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Agregar al Carrito
        </Button>
      </CardFooter>
    </Card>
  );
};
