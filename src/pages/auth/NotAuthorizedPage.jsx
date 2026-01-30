import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';

/**
 * Not Authorized Page
 * Shown when user doesn't have required role (non-dietitian)
 */
const NotAuthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Content */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Access Denied
        </h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. This application is only available to registered dietitians and nutritionists.
        </p>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-blue-800">
            <strong>Are you a dietitian?</strong><br />
            Please contact support at <a href="mailto:support@nutriplan.pro" className="underline">support@nutriplan.pro</a> to request access.
          </p>
        </div>

        {/* Action button */}
        <Button onClick={() => navigate('/login')} className="w-full">
          Back to Login
        </Button>
      </div>
    </div>
  );
};

export default NotAuthorizedPage;
