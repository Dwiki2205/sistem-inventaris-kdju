import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { PackageIcon } from 'lucide-react';
import { Item } from '@/types';

interface ItemCardProps {
  item: Item;
  onClick: () => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onClick }) => {
  const conditionColors = {
    baik: 'bg-success text-success-foreground',
    rusak: 'bg-error text-error-foreground',
    perlu_perbaikan: 'bg-warning text-warning-foreground',
  };

  const conditionLabels = {
    baik: 'Baik',
    rusak: 'Rusak',
    perlu_perbaikan: 'Perlu Perbaikan',
  };

  return (
    <Card 
      className="p-4 sm:p-6 bg-card text-card-foreground hover:shadow-md transition-all duration-200 cursor-pointer border border-border hover:border-primary/20 h-full flex flex-col"
      onClick={onClick}
    >
      {/* Image/Icon Section */}
      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-4 overflow-hidden">
        {item.image_data ? (
          <img
            src={item.image_data}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <PackageIcon className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" strokeWidth={1.5} />
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col">
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 text-sm sm:text-base leading-tight">
          {item.name}
        </h3>
        
        <p className="text-muted-foreground text-xs sm:text-sm mb-3 line-clamp-1">
          {item.category}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Stok</p>
            <p className="text-lg sm:text-xl font-mono font-semibold text-foreground">
              {item.stock}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Lokasi</p>
            <p className="text-sm font-medium text-foreground line-clamp-1">
              {item.location}
            </p>
          </div>
        </div>

        {/* Condition Badge */}
        <div className="mt-auto">
          <Badge 
            variant="secondary"
            className={`text-xs ${
              conditionColors[item.condition as keyof typeof conditionColors]
            }`}
          >
            {conditionLabels[item.condition as keyof typeof conditionLabels]}
          </Badge>
        </div>
      </div>
    </Card>
  );
};

export default ItemCard;