import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Play,
  Lock,
  CheckCircle,
  Award,
  ChevronRight,
  ArrowLeft,
  Target,
  GraduationCap
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { educationService, type Course, type Lesson, type UserProgress } from '@/lib/education';
import { useAuth } from '@/lib/auth-context';

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Load course data
  useEffect(() => {
    if (courseId) {
      const courseData = educationService.getCourseById(courseId);
      setCourse(courseData || null);
      
      if (courseData?.lessons.length > 0) {
        setActiveLesson(courseData.lessons[0]);
      }
    }
  }, [courseId]);

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('education.courseNotFound', 'Course not found')}
          </h2>
          <Link to="/courses">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.backToCourses', 'Back to Courses')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get course progress
  const getCourseProgress = () => {
    if (!user?.user?.id) return 0;
    
    const userLessons = userProgress.filter(p => 
      p.userId === user.user.id && 
      course.lessons.some(lesson => lesson.id === p.lessonId)
    );
    const completedLessons = userLessons.filter(p => p.completed).length;
    
    return course.lessons.length > 0 ? (completedLessons / course.lessons.length) * 100 : 0;
  };

  // Get lesson progress
  const getLessonProgress = (lessonId: string) => {
    if (!user?.user?.id) return false;
    
    return userProgress.some(p => 
      p.userId === user.user.id && 
      p.lessonId === lessonId && 
      p.completed
    );
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

  const progress = getCourseProgress();
  const isCompleted = progress === 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/courses">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.backToCourses', 'Back to Courses')}
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
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
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {course.title}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {course.description}
              </p>
              
              <div className="flex items-center gap-6 text-sm text-gray-500">
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
            </div>
            
            <div className="lg:w-80">
              {/* Progress Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {t('education.progress', 'Progress')}
                        </span>
                        <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    
                    <Button className="w-full" size="lg">
                      <Play className="h-4 w-4 mr-2" />
                      {progress > 0 ? t('education.continue', 'Continue Learning') : t('education.start', 'Start Course')}
                    </Button>
                    
                    {isCompleted && (
                      <div className="flex items-center justify-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-md">
                        <Award className="h-4 w-4" />
                        <span>{t('education.certificateAvailable', 'Certificate Available')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">{t('education.tabs.overview', 'Overview')}</TabsTrigger>
                <TabsTrigger value="curriculum">{t('education.tabs.curriculum', 'Curriculum')}</TabsTrigger>
                <TabsTrigger value="instructor">{t('education.tabs.instructor', 'Instructor')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                {/* Learning Objectives */}
                {course.learningObjectives.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        {t('education.learningObjectives', 'What you\'ll learn')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {course.learningObjectives.map((objective, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Course Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('education.courseDescription', 'Course Description')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p>{course.description}</p>
                      <p className="mt-4 text-gray-600">
                        This comprehensive course covers all the essential topics needed to become a successful trader 
                        in the Indonesian market. Through hands-on lessons, quizzes, and practical examples, 
                        you'll gain the knowledge and confidence to start your trading journey.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="curriculum">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('education.courseCurriculum', 'Course Curriculum')}</CardTitle>
                    <CardDescription>
                      {course.lessons.length} {t('common.lessons', 'lessons')} • {course.durationMinutes} {t('common.minutes', 'minutes')} total
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {course.lessons.map((lesson, index) => {
                        const isCompleted = getLessonProgress(lesson.id);
                        const isLocked = index > 0 && !getLessonProgress(course.lessons[index - 1].id) && !isCompleted;
                        
                        return (
                          <div
                            key={lesson.id}
                            className={`flex items-center justify-between p-4 border rounded-lg ${
                              isLocked ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0">
                                {isCompleted ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : isLocked ? (
                                  <Lock className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <Play className="h-5 w-5 text-blue-500" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium">{lesson.title}</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {lesson.durationMinutes} min
                                  </span>
                                  {lesson.quiz && (
                                    <span className="flex items-center gap-1">
                                      <GraduationCap className="h-3 w-3" />
                                      {t('education.hasQuiz', 'Quiz')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              size="sm"
                              disabled={isLocked}
                              onClick={() => setActiveLesson(lesson)}
                            >
                              {isCompleted ? t('education.review', 'Review') : 
                               isLocked ? t('education.locked', 'Locked') :
                               t('education.start', 'Start')}
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="instructor">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('education.instructorInfo', 'Instructor Information')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {course.instructor?.split(' ').map(n => n[0]).join('') || 'SS'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{course.instructor || 'Signal Sage AI Team'}</h3>
                        <p className="text-gray-600 mb-2">Trading Education Expert</p>
                        <p className="text-sm text-gray-500">
                          Experienced trader and educator with deep knowledge of Indonesian financial markets. 
                          Specialized in helping beginners develop strong trading fundamentals and risk management skills.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('education.courseStats', 'Course Stats')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{t('education.level', 'Level')}</span>
                  <Badge variant="secondary" className={getLevelBadgeColor(course.level)}>
                    {t(`education.level.${course.level}`, course.level)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{t('education.duration', 'Duration')}</span>
                  <span className="text-sm font-medium">{course.durationMinutes} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{t('education.lessons', 'Lessons')}</span>
                  <span className="text-sm font-medium">{course.lessons.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{t('education.language', 'Language')}</span>
                  <span className="text-sm font-medium">Bahasa Indonesia</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{t('education.certificate', 'Certificate')}</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              </CardContent>
            </Card>

            {/* Related Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('education.relatedCourses', 'Related Courses')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {educationService.getCourses({ level: course.level }).slice(0, 3).map((relatedCourse) => (
                    <Link 
                      key={relatedCourse.id} 
                      to={`/courses/${relatedCourse.id}`}
                      className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <h4 className="font-medium text-sm mb-1">{relatedCourse.title}</h4>
                      <p className="text-xs text-gray-600">{relatedCourse.lessons.length} lessons</p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;