import { useState } from 'react';
import Button from '../ui/Button';

const BrandingWizard = ({ steps, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    businessName: '',
    tagline: '',
    logoUrl: '',
    logoFile: null,
    primaryColor: '#22c55e',
    secondaryColor: '#16a34a',
    fontFamily: 'Inter',
    headerSettings: {
      showBusinessName: true,
      showLogo: true,
      logoAlignment: 'left'
    },
    footerSettings: {
      showContact: true,
      contactInfo: '',
      showDisclaimer: true,
      disclaimerText: 'This meal plan is for informational purposes only and should not replace professional medical advice.'
    }
  });

  const totalSteps = steps.length;
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    console.log('handleNext called, currentStep:', currentStep, 'totalSteps:', totalSteps)
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      console.log('Calling onComplete with formData:', formData)
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Set Up Your Branding
            </h2>
            <span className="text-sm text-gray-600">
              Step {currentStep + 1} of {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {steps[currentStep].title}
          </h3>
          <p className="text-gray-600 mb-6">
            {steps[currentStep].description}
          </p>
          
          <CurrentStepComponent 
            formData={formData}
            updateFormData={updateFormData}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={steps[currentStep].validate && !steps[currentStep].validate(formData)}
          >
            {currentStep === totalSteps - 1 ? 'Complete Setup' : 'Next Step'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BrandingWizard;
