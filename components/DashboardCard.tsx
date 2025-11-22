import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  Icon: LucideIcon;
  color: 'primary' | 'tertiary' | 'error' | 'accent-orange';
}

const colorMap = {
  primary: 'bg-blue-50 border-blue-200 text-blue-700',
  tertiary: 'bg-purple-50 border-purple-200 text-purple-700',
  error: 'bg-red-50 border-red-200 text-red-700',
  'accent-orange': 'bg-orange-50 border-orange-200 text-orange-700'
};

const iconColorMap = {
  primary: 'text-blue-600',
  tertiary: 'text-purple-600',
  error: 'text-red-600',
  'accent-orange': 'text-orange-600'
};

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  Icon,
  color
}) => {
  return (
    <Card className={`border-2 ${colorMap[color]} animate-fade-in`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-full ${iconColorMap[color]} bg-white/50`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;