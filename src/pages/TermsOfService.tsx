import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Shield, Users, DollarSign, AlertTriangle, FileText, CheckCircle } from 'lucide-react';

export default function TermsOfService() {
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
            {t('legal.termsOfService')}
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
                Educational Platform Agreement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Welcome to Signal Sage AI. By accessing and using our platform, you agree to be bound by these Terms of Service.
                Signal Sage AI is an educational platform that provides AI-powered trading analysis and signals for learning purposes only.
              </p>
              <p className="text-gray-700 leading-relaxed">
                {t('legal.disclaimerText')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="h-6 w-6 text-green-600" />
                User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Educational Use Only</h4>
                    <p className="text-gray-600">Use our platform solely for educational and learning purposes.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Risk Awareness</h4>
                    <p className="text-gray-600">Understand that all trading involves risk and past performance doesn't guarantee future results.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">No Financial Advice</h4>
                    <p className="text-gray-600">Never make financial decisions based solely on our AI-generated content.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <DollarSign className="h-6 w-6 text-purple-600" />
                Payment and Subscription Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Cryptocurrency Payments</h4>
                  <p className="text-gray-600">
                    We accept cryptocurrency payments (Bitcoin, Ethereum, USDT, BNB). All payments are final and non-refundable 
                    unless required by applicable law.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Subscription Plans</h4>
                  <p className="text-gray-600">
                    Our subscription plans offer different levels of access to AI features. You can upgrade, downgrade, or cancel 
                    your subscription at any time through your account settings.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Auto-Renewal</h4>
                  <p className="text-gray-600">
                    Paid subscriptions automatically renew unless cancelled. You're responsible for maintaining sufficient crypto balance 
                    for renewal payments.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
                Risk Disclaimer and Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-900 mb-2">Important Risk Warning</h4>
                <p className="text-orange-800 leading-relaxed">
                  Trading financial instruments carries a high level of risk and may not be suitable for all investors. 
                  The possibility exists that you could sustain a loss of some or all of your initial investment. 
                  Therefore, you should not invest money that you cannot afford to lose.
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900">AI Limitations</h4>
                  <p className="text-gray-600">
                    Our AI provides analysis based on historical data and patterns. It may not account for unexpected market events, 
                    news, or other factors that can affect market movements.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">No Guarantee of Results</h4>
                  <p className="text-gray-600">
                    We do not guarantee any specific trading results, profits, or outcomes. Past performance of our AI signals 
                    does not guarantee future performance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-indigo-600" />
                Indonesian Legal Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                {t('legal.complianceText')}
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900">OJK Compliance</h4>
                  <p className="text-gray-600">
                    We operate as an educational platform and comply with Indonesian Financial Services Authority (OJK) guidelines 
                    for financial education services.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">ITE Law Compliance</h4>
                  <p className="text-gray-600">
                    Our platform adheres to Indonesia's Electronic Information and Transactions (ITE) Law, including data protection 
                    and electronic transaction regulations.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Data Privacy</h4>
                  <p className="text-gray-600">
                    User data is protected under Indonesian Personal Data Protection Law. See our Privacy Policy for detailed information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact and Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 space-y-2">
                <p className="text-gray-600">
                  <strong>Email:</strong> legal@signalsage.ai
                </p>
                <p className="text-gray-600">
                  <strong>Address:</strong> Jakarta, Indonesia
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
