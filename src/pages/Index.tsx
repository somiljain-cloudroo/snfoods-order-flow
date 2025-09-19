import { useState } from "react";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Cart } from "@/components/Cart";
import { products, categories, type Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, Users, Award, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import heroBanner from "@/assets/hero-banner.jpg";

interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  unit: string;
}

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const handleAddToCart = (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCartItems(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing) {
        return prev.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        quantity,
        unit: product.unit
      }];
    });

    toast({
      title: "Added to Cart",
      description: `${quantity}x ${product.name} added to your cart`,
    });
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(id);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Item Removed",
      description: "Item removed from your cart",
    });
  };

  const handleCheckout = () => {
    toast({
      title: "Checkout Started",
      description: "Redirecting to checkout... (Connect Supabase for full functionality)",
    });
  };

  const handleLogin = () => {
    toast({
      title: "Login Required",
      description: "Please connect Supabase to enable authentication",
    });
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        cartCount={cartCount}
        onCartClick={() => {}}
        onLoginClick={handleLogin}
      />

      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-hero flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroBanner})` }}
        />
        <div className="relative z-10 text-center text-primary-foreground px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Premium Food Distribution
          </h1>
          <p className="text-lg md:text-xl mb-8 text-primary-foreground/90">
            Quality Filipino, Asian & International products for over 10 years
          </p>
          <Button size="lg" className="bg-white/20 hover:bg-white/30 text-primary-foreground border border-white/30">
            Shop Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-gradient-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-primary">500+</h3>
              <p className="text-muted-foreground">Products Available</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-primary">1000+</h3>
              <p className="text-muted-foreground">Happy Customers</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-primary">10+</h3>
              <p className="text-muted-foreground">Years Experience</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-primary">Fast</h3>
              <p className="text-muted-foreground">Order Processing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Our Products</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover our extensive range of quality food products sourced from trusted brands worldwide
            </p>
          </div>

          <div className="mb-8">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Cart */}
      <Cart
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
        trigger={
          <div className="fixed bottom-6 right-6 z-40">
            <Button 
              size="lg"
              className="bg-gradient-primary hover:bg-gradient-warm shadow-cart rounded-full h-14 w-14 p-0"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs rounded-full h-6 w-6 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>
        }
      />
    </div>
  );
};

export default Index;