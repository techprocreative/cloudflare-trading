import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Shield, Database, Eye, Lock, User, Settings, Globe, Trash2 } from 'lucide-react';

export default function PrivacyPolicy() {
  const { t, i18n } = useTranslation();

  const lastUpdated = new Date().toLocaleDateString(i18n.language === 'id' ? 'id-ID' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('legal.privacyPolicy')}
          </h1>
          <p className="text-lg text-gray-600">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-blue-600" />
                Data Protection Commitment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                At Signal Sage AI, we are committed to protecting your privacy and ensuring the security of your personal data. 
                This Privacy Policy explains how we collect, use, store, and protect your information in compliance with 
                Indonesian Personal Data Protection Law and GDPR standards.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using our platform, you consent to the collection and use of information as described in this policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <User className="h-6 w-6 text-green-600" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Personal Information</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Name and email address</li>
                    <li>Phone number (optional)</li>
                    <li>Cryptocurrency wallet addresses</li>
                    <li>Demographic information</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Usage Data</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Trading signals and AI interactions</li>
                    <li>Watchlist and portfolio data</li>
                    <li>Course progress and quiz results</li>
                    <li>Platform usage patterns and preferences</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Technical Data</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>IP address and device information</li>
                    <li>Browser and operating system details</li>
                    <li>Cookies and tracking technologies</li>
                    <li>Session duration and page navigation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Settings className="h-6 w-6 text-purple-600" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900">Service Delivery</h4>
                  <p className="text-gray-600">
                    Provide AI-powered trading analysis, educational content, and platform functionality tailored to your needs.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Personalization</h4>
                  <p className="text-gray-600">
                    Customize your experience with relevant content, trading signals, and educational recommendations.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Communication</h4>
                  <p className="text-gray-600">
                    Send important updates, account information, and educational content via email or platform notifications.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Platform Improvement</h4>
                  <p className="text-gray-600">
                    Analyze usage patterns to improve our AI algorithms, user experience, and platform features.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Legal Compliance</h4>
                  <p className="text-gray-600">
                    Comply with legal obligations and protect our platform from fraud and misuse.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Database className="h-6 w-6 text-orange-600" />
                Data Storage and Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Cloudflare Infrastructure</h4>
                  <p className="text-gray-600">
                    Your data is stored securely on Cloudflare's global network with encryption at rest and in transit.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Data Encryption</h4>
                  <p className="text-gray-600">
                    All sensitive data is encrypted using industry-standard AES-256 encryption protocols.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Access Controls</h4>
                  <p className="text-gray-600">
                    Strict access controls and authentication mechanisms prevent unauthorized access to your data.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Regular Audits</h4>
                  <p className="text-gray-600">
                    We conduct regular security audits and penetration testing to identify and address vulnerabilities.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Eye className="h-6 w-6 text-indigo-600" />
                Data Sharing and Third Parties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="text-indigo-800 leading-relaxed">
                  We do not sell, rent, or trade your personal information with third parties for marketing purposes.
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900">Limited Sharing</h4>
                  <p className="text-gray-600">
                    We may share your information only in specific circumstances:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                    <li>With your explicit consent</li>
                    <li>To process cryptocurrency transactions</li>
                    <li>When required by law or legal process</li>
                    <li>To protect our rights, property, or safety</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Service Providers</h4>
                  <p className="text-gray-600">
                    We work with trusted third-party service providers who assist in operating our platform, 
                    such as cloud hosting, payment processing, and analytics services.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Lock className="h-6 w-6 text-green-600" />
                Your Rights and Choices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900">Access and Correction</h4>
                  <p className="text-gray-600">
                    You can access, view, and update your personal information through your account settings at any time.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Data Portability</h4>
                  <p className="text-gray-600">
                    Request a copy of your personal data in a machine-readable format.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Deletion</h4>
                  <p className="text-gray-600">
                    Request deletion of your account and personal data, subject to legal retention requirements.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Consent Management</h4>
                  <p className="text-gray-600">
                    Withdraw consent for data processing where alternative processing methods are available.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Complaint Rights</h4>
                  <p className="text-gray-600">
                    File complaints with Indonesian data protection authorities or relevant regulatory bodies.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Globe className="h-6 w-6 text-blue-600" />
                International Data Transfers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                As an Indonesian platform serving global users, your data may be processed and stored outside Indonesia. 
                We ensure such transfers comply with Indonesian Personal Data Protection Law requirements and provide 
                adequate protection through appropriate safeguards.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Trash2 className="h-6 w-6 text-red-600" />
                Data Retention and Deletion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900">Retention Period</h4>
                  <p className="text-gray-600">
                    We retain your data only as long as necessary to provide our services and comply with legal obligations.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Automatic Deletion</h4>
                  <p className="text-gray-600">
                    Free accounts inactive for more than 12 months may be automatically deleted after notice.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Secure Deletion</h4>
                  <p className="text-gray-600">
                    When we delete your data, we ensure it's permanently and securely erased from our systems.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Updates to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We'll notify you of significant changes via email or 
                platform notifications. Continued use of our services after such updates constitutes acceptance of the revised policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about this Privacy Policy or need to exercise your rights, please contact us:
              </p>
              <div className="mt-4 space-y-2">
                <p className="text-gray-600">
                  <strong>Email:</strong> privacy@signalsage.ai
                </p>
                <p className="text-gray-600">
                  <strong>Address:</strong> Jakarta, Indonesia
                </p>
                <p className="text-gray-600">
                  <strong>Response Time:</strong> Within 30 days for data-related requests
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 border-t border-gray-200 pt-8 text-center">
        <div className="flex justify-center gap-6 text-sm">
          <Link
            to="/terms"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            {t('legal.termsOfService')}
          </Link>
          <Link
            to="/privacy"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            {t('legal.privacyPolicy')}
          </Link>
          <Link
            to="/pricing"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            {t('nav.pricing')}
          </Link>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          © 2024 Signal Sage AI. All rights reserved.
        </p>
      </div>
    </div>
  );
}
