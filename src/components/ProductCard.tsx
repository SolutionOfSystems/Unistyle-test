// Reusable product card shown on the home page grid.
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/product/${product.id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow border-border">
        <div className="aspect-square bg-muted overflow-hidden">
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{product.category}</p>
          <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
          <p className="font-semibold mt-1">${Number(product.price).toFixed(2)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
