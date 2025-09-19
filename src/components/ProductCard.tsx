import { Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  unit: string;
  category: string;
  inStock: boolean;
  minOrder?: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string, quantity: number) => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const [quantity, setQuantity] = useState(product.minOrder || 1);

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max((product.minOrder || 1), quantity + change);
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    onAddToCart(product.id, quantity);
    setQuantity(product.minOrder || 1);
  };

  return (
    <Card className="group hover:shadow-product transition-all duration-300 bg-gradient-card border-0 overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-square relative overflow-hidden bg-muted/20">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs font-medium">
              {product.category}
            </Badge>
          </div>
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive">Out of Stock</Badge>
            </div>
          )}
        </div>
        
        <div className="p-4 space-y-3">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{product.brand}</p>
            <h3 className="font-semibold text-card-foreground line-clamp-2 leading-tight">
              {product.name}
            </h3>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-primary">${product.price.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">per {product.unit}</p>
              {product.minOrder && (
                <p className="text-xs text-muted-foreground">Min order: {product.minOrder}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 space-y-3">
        {product.inStock ? (
          <>
            <div className="flex items-center justify-center gap-2 w-full">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= (product.minOrder || 1)}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="min-w-[3rem] text-center font-medium">{quantity}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleQuantityChange(1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            <Button 
              className="w-full bg-gradient-primary hover:bg-gradient-warm transition-all duration-300"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </>
        ) : (
          <Button disabled className="w-full">
            Out of Stock
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};