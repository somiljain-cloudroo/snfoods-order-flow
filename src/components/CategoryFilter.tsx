import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg">
      <Button
        variant={selectedCategory === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => onCategoryChange("all")}
        className={selectedCategory === "all" ? "bg-gradient-primary" : ""}
      >
        All Products
      </Button>
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category)}
          className={selectedCategory === category ? "bg-gradient-primary" : ""}
        >
          {category}
        </Button>
      ))}
    </div>
  );
};