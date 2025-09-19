import { X, Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  unit: string;
}

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  trigger: React.ReactNode;
}

export const Cart = ({ items, onUpdateQuantity, onRemoveItem, onCheckout, trigger }: CartProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% GST
  const total = subtotal + tax;
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg bg-gradient-card">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart ({items.length} items)
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full mt-6">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Your cart is empty</p>
                <p className="text-sm text-muted-foreground mt-1">Add products to get started</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-4 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="bg-card/50 p-4 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">{item.brand}</p>
                        <h4 className="font-medium line-clamp-2">{item.name}</h4>
                        <p className="text-sm text-primary font-semibold mt-1">
                          ${item.price.toFixed(2)} per {item.unit}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="min-w-[2rem] text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Badge className="bg-gradient-primary">
                        ${(item.price * item.quantity).toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>GST (10%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-gradient-primary hover:bg-gradient-warm transition-all duration-300"
                  onClick={() => {
                    onCheckout();
                    setIsOpen(false);
                  }}
                  disabled={items.length === 0}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};