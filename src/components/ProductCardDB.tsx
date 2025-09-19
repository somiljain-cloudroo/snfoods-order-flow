import { Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Database } from '@/lib/supabase';

type Product = Database['public']['Tables']['products']['Row'] & {
  category?: Database['public']['Tables']['categories']['Row'];
};

interface ProductCardDBProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductCardDB = ({ product, onAddToCart }: ProductCardDBProps) => {
  const [quantity, setQuantity] = useState(product.min_order_quantity || 1);

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(product.min_order_quantity || 1, quantity + change);
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setQuantity(product.min_order_quantity || 1);
  };

  const isInStock = product.stock_quantity > 0;

  return (
    <Card className="group hover:shadow-product transition-all duration-300 bg-gradient-card border-0 overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-square relative overflow-hidden bg-muted/20">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-primary mb-1">{product.brand}</div>
                <div className="text-sm text-muted-foreground">{product.name}</div>
              </div>
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs font-medium">
              {product.category?.name || 'General'}
            </Badge>
          </div>
          {!isInStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive">Out of Stock</Badge>
            </div>
          )}
        </div>
        
        <div className="p-4 space-y-3">
          <div>
            {product.brand && (
              <p className="text-sm text-muted-foreground font-medium">{product.brand}</p>
            )}
            <h3 className="font-semibold text-card-foreground line-clamp-2 leading-tight">
              {product.name}
            </h3>
            {product.sku && (
              <p className="text-xs text-muted-foreground mt-1">SKU: {product.sku}</p>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-primary">${product.price.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">per {product.unit}</p>
              {product.min_order_quantity > 1 && (
                <p className="text-xs text-muted-foreground">Min order: {product.min_order_quantity}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Stock: {product.stock_quantity}</p>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 space-y-3">
        {isInStock ? (
          <>
            <div className="flex items-center justify-center gap-2 w-full">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= (product.min_order_quantity || 1)}
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