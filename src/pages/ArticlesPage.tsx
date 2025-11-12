import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Clock, 
  Search, 
  Filter,
  Eye,
  Calendar,
  Tag,
  TrendingUp,
  ArrowRight,
  User
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { educationService, type Article } from '@/lib/education';

const ArticlesPage: React.FC = () => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);

  // Load articles
  useEffect(() => {
    const allArticles = educationService.getArticles();
    const featured = educationService.getFeaturedArticles();
    
    setArticles(allArticles);
    setFilteredArticles(allArticles);
    setFeaturedArticles(featured);
  }, []);

  // Filter articles
  useEffect(() => {
    let filtered = articles;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    setFilteredArticles(filtered);
  }, [searchTerm, selectedCategory, articles]);

  // Get category badge color
  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'tutorial': return 'bg-blue-100 text-blue-800';
      case 'technical': return 'bg-purple-100 text-purple-800';
      case 'fundamental': return 'bg-green-100 text-green-800';
      case 'psychology': return 'bg-yellow-100 text-yellow-800';
      case 'risk': return 'bg-red-100 text-red-800';
      case 'news': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get category translation
  const getCategoryName = (category: string) => {
    const categoryNames: Record<string, string> = {
      'tutorial': 'Tutorial',
      'technical': 'Technical Analysis',
      'fundamental': 'Fundamental Analysis',
      'psychology': 'Trading Psychology',
      'risk': 'Risk Management',
      'news': 'Market News'
    };
    return categoryNames[category] || category;
  };

  // Unique categories
  const categories = Array.from(new Set(articles.map(article => article.category)));

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              {t('education.articles.title', 'Trading Knowledge Hub')}
            </h1>
            <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
              {t('education.articles.subtitle', 'Discover expert insights, strategies, and guides for successful trading in Indonesian markets.')}
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder={t('education.search.articles', 'Search articles...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                {t('education.articles.featured', 'Featured Articles')}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {featuredArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                    <BookOpen className="h-12 w-12 opacity-80" />
                  </div>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge 
                        variant="secondary" 
                        className={getCategoryBadgeColor(article.category)}
                      >
                        {getCategoryName(article.category)}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Eye className="h-4 w-4" />
                        <span>{article.views.toLocaleString()}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight hover:text-blue-600 transition-colors">
                      <Link to={`/articles/${article.slug}`}>
                        {article.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {article.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{article.authorName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{article.readTime} min read</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {t('common.filters', 'Filters')}:
            </span>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">{t('education.category.all', 'All Categories')}</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {getCategoryName(category)}
              </option>
            ))}
          </select>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge 
                    variant="secondary" 
                    className={getCategoryBadgeColor(article.category)}
                  >
                    {getCategoryName(article.category)}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Eye className="h-4 w-4" />
                    <span>{article.views.toLocaleString()}</span>
                  </div>
                </div>
                
                <CardTitle className="text-lg leading-tight hover:text-blue-600 transition-colors">
                  <Link to={`/articles/${article.slug}`}>
                    {article.title}
                  </Link>
                </CardTitle>
                <CardDescription className="text-sm">
                  {article.excerpt}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Tags */}
                {article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {article.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {article.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{article.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Article Meta */}
                <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{article.authorName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{article.readTime} min read</span>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(article.publishedAt)}</span>
                </div>

                {/* Read More Button */}
                <Link to={`/articles/${article.slug}`} className="block">
                  <Button variant="outline" className="w-full group">
                    {t('education.articles.readMore', 'Read More')}
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('education.articles.noArticles', 'No articles found')}
            </h3>
            <p className="text-gray-500">
              {t('education.articles.tryAdjustFilters', 'Try adjusting your search or filters')}
            </p>
          </div>
        )}

        {/* Categories Overview */}
        {categories.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('education.articles.browseByCategory', 'Browse by Category')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => {
                const categoryCount = articles.filter(a => a.category === category).length;
                return (
                  <Card 
                    key={category}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedCategory(category)}
                  >
                    <CardContent className="p-4 text-center">
                      <Badge 
                        variant="secondary" 
                        className={getCategoryBadgeColor(category) + ' mb-2'}
                      >
                        {getCategoryName(category)}
                      </Badge>
                      <p className="text-sm text-gray-600">
                        {categoryCount} {categoryCount === 1 ? 'article' : 'articles'}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlesPage;