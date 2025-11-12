import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Search, 
  Filter,
  Play,
  Lock,
  CheckCircle,
  Award
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { educationService, type Course, type UserProgress } from '@/lib/education';
import { useAuth } from '@/lib/auth-context';

const CoursesPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);

  // Load courses
  useEffect(() => {
    const availableCourses = educationService.getCourses();
    setCourses(availableCourses);
    setFilteredCourses(availableCourses);
  }, []);

  // Filter courses
  useEffect(() => {
    let filtered = courses;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Level filter
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    setFilteredCourses(filtered);
  }, [searchTerm, selectedLevel, selectedCategory, courses]);

  // Get course progress
  const getCourseProgress = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course || !user?.user?.id) return 0;

    const userLessons = userProgress.filter(p =>
      p.userId === user.user.id &&
      course.lessons.some(lesson => lesson.id === p.lessonId)
    );
    const completedLessons = userLessons.filter(p => p.completed).length;
    
    return course.lessons.length > 0 ? (completedLessons / course.lessons.length) * 100 : 0;
  };

  // Get difficulty badge color
  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Unique categories
  const categories = Array.from(new Set(courses.map(course => course.category)));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              {t('education.courses.title', 'Trading Education Courses')}
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {t('education.courses.subtitle', 'Master Indonesian trading with our comprehensive courses designed for all skill levels.')}
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder={t('education.search.placeholder', 'Search courses...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {t('common.filters', 'Filters')}:
            </span>
          </div>
          
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">{t('education.level.all', 'All Levels')}</option>
            <option value="beginner">{t('education.level.beginner', 'Beginner')}</option>
            <option value="intermediate">{t('education.level.intermediate', 'Intermediate')}</option>
            <option value="advanced">{t('education.level.advanced', 'Advanced')}</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">{t('education.category.all', 'All Categories')}</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {t(`education.category.${category}`, category)}
              </option>
            ))}
          </select>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const progress = getCourseProgress(course.id);
            const isCompleted = progress === 100;
            
            return (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge 
                      variant="secondary" 
                      className={getLevelBadgeColor(course.level)}
                    >
                      {t(`education.level.${course.level}`, course.level)}
                    </Badge>
                    {course.isPremium && (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                        <Lock className="h-3 w-3 mr-1" />
                        {t('common.premium', 'Premium')}
                      </Badge>
                    )}
                    {isCompleted && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {t('education.status.completed', 'Completed')}
                      </Badge>
                    )}
                  </div>
                  
                  <CardTitle className="text-lg leading-tight">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Course Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.durationMinutes} {t('common.minutes', 'min')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.lessons.length} {t('common.lessons', 'lessons')}</span>
                    </div>
                    {course.instructor && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{course.instructor}</span>
                      </div>
                    )}
                  </div>

                  {/* Learning Objectives */}
                  {course.learningObjectives.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">
                        {t('education.learningObjectives', 'What you\'ll learn')}:
                      </h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {course.learningObjectives.slice(0, 3).map((objective, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{objective}</span>
                          </li>
                        ))}
                        {course.learningObjectives.length > 3 && (
                          <li className="text-gray-500">
                            +{course.learningObjectives.length - 3} {t('common.more', 'more')}
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Progress Bar (if user has progress) */}
                  {user && progress > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-medium text-gray-700">
                          {t('education.progress', 'Progress')}
                        </span>
                        <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Link to={`/courses/${course.id}`} className="flex-1">
                      <Button variant="default" className="w-full">
                        <Play className="h-4 w-4 mr-2" />
                        {progress > 0 ? t('education.continue', 'Continue') : t('education.start', 'Start Course')}
                      </Button>
                    </Link>
                    
                    {!course.isPremium && (
                      <Button variant="outline" size="sm">
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Certificate badge for completed courses */}
                  {isCompleted && (
                    <div className="flex items-center justify-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded-md">
                      <Award className="h-4 w-4" />
                      <span>{t('education.certificateAvailable', 'Certificate Available')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('education.noCourses', 'No courses found')}
            </h3>
            <p className="text-gray-500">
              {t('education.tryAdjustFilters', 'Try adjusting your search or filters')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;