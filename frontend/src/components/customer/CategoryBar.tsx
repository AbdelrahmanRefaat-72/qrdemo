import React from 'react';
import { Category } from '../../types';
import { useLangStore } from '../../store/useLangStore';
import * as Icons from 'lucide-react';

interface CategoryBarProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const { lang, t } = useLangStore();

  const renderIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName] || Icons.Utensils;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-3 px-4 sm:px-6">
      <div className="flex items-center gap-2.5 min-w-max">
        {/* All Categories Button */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 shadow-sm ${
            selectedCategoryId === null
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-dark-950 shadow-amber-500/2 shadow-lg scale-105'
              : 'bg-white dark:bg-dark-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800 border border-gray-200/60 dark:border-gray-800'
          }`}
        >
          <Icons.LayoutGrid className="w-4 h-4" />
          <span>{t.allCategories}</span>
        </button>

        {/* Dynamic Categories */}
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          const catName = lang === 'ar' ? cat.name_ar : cat.name_en;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 shadow-sm ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-dark-950 shadow-amber-500/20 shadow-lg scale-105'
                  : 'bg-white dark:bg-dark-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800 border border-gray-200/60 dark:border-gray-800'
              }`}
            >
              {renderIcon(cat.icon)}
              <span>{catName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
