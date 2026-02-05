import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile } from '../../services/userService';
import { getBrandingSettings } from '../../services/brandingService';

/**
 * BrandedDietPlan Component
 * Professional PDF-ready diet plan with dietitian branding
 * - Header with logo and clinic name
 * - Footer with contact info
 * - Clean, professional formatting
 * - No AI references
 */
export default function BrandedDietPlan({ planContent, clientName, planTitle }) {
  const { user } = useAuth();
  const [branding, setBranding] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    loadBranding();
  }, [user]);

  const loadBranding = async () => {
    if (!user) return;
    
    try {
      const [brandingData, profileData] = await Promise.all([
        getBrandingSettings(user.uid),
        getUserProfile(user.uid)
      ]);
      
      setBranding(brandingData);
      setUserProfile(profileData);
    } catch (error) {
      console.error('Error loading branding:', error);
    }
  };

  const parseDietPlan = (content) => {
    if (!content) return [];
    
    const lines = content.split('\n');
    const sections = [];
    let currentSection = null;

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Detect headings (ending with : or all caps)
      if (trimmed.endsWith(':') || trimmed === trimmed.toUpperCase()) {
        if (currentSection) sections.push(currentSection);
        currentSection = {
          type: 'heading',
          title: trimmed.replace(':', ''),
          content: []
        };
      }
      // Detect bullet points
      else if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
        if (currentSection) {
          currentSection.content.push({
            type: 'bullet',
            text: trimmed.replace(/^[-•]\s*/, '')
          });
        }
      }
      // Regular text
      else {
        if (currentSection) {
          currentSection.content.push({
            type: 'text',
            text: trimmed
          });
        }
      }
    });

    if (currentSection) sections.push(currentSection);
    return sections;
  };

  const sections = parseDietPlan(planContent);
  
  // Extract branding info with proper fallbacks
  const clinicName = branding?.businessName || userProfile?.displayName || userProfile?.email?.split('@')[0] || 'Nutrition Clinic';
  const logo = branding?.logoUrl;
  const primaryColor = branding?.primaryColor || '#22c55e';
  
  // Contact info from branding footer settings or user profile
  const phone = branding?.footerSettings?.phone || '';
  const email = branding?.footerSettings?.email || userProfile?.email || '';
  const website = branding?.footerSettings?.website || '';
  const address = branding?.footerSettings?.address || '';

  console.log('🎨 Branding loaded:', { clinicName, logo, primaryColor, phone, email });

  return (
    <div className="branded-diet-plan" style={{ 
      maxWidth: '210mm',
      margin: '0 auto',
      backgroundColor: 'white',
      color: '#000',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12pt',
      lineHeight: '1.6'
    }}>
      {/* Professional Header */}
      <div className="plan-header" style={{
        borderBottom: `3px solid ${primaryColor}`,
        paddingBottom: '20px',
        marginBottom: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          {logo && (
            <img 
              src={logo} 
              alt="Logo" 
              style={{
                maxHeight: '60px',
                maxWidth: '150px',
                marginBottom: '10px'
              }}
            />
          )}
          <h1 style={{
            fontSize: '24pt',
            fontWeight: 'bold',
            margin: '0',
            color: primaryColor
          }}>
            {clinicName}
          </h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '10pt', color: '#666' }}>
            Personalized Nutrition Plan
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11pt', fontWeight: 'bold' }}>
            {clientName}
          </div>
          <div style={{ fontSize: '10pt', color: '#666' }}>
            {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* Plan Title */}
      {planTitle && (
        <h2 style={{
          fontSize: '18pt',
          fontWeight: 'bold',
          marginBottom: '20px',
          color: '#333'
        }}>
          {planTitle}
        </h2>
      )}

      {/* Plan Content */}
      <div className="plan-content">
        {sections.map((section, idx) => (
          <div key={idx} style={{ marginBottom: '25px' }}>
            {section.type === 'heading' && (
              <h3 style={{
                fontSize: '14pt',
                fontWeight: 'bold',
                color: primaryColor,
                marginBottom: '12px',
                borderBottom: `1px solid #e5e7eb`,
                paddingBottom: '5px'
              }}>
                {section.title}
              </h3>
            )}
            
            <div style={{ marginLeft: section.type === 'heading' ? '0' : '15px' }}>
              {section.content.map((item, itemIdx) => {
                if (item.type === 'bullet') {
                  return (
                    <div key={itemIdx} style={{
                      display: 'flex',
                      marginBottom: '8px',
                      fontSize: '11pt'
                    }}>
                      <span style={{ marginRight: '8px', color: primaryColor }}>•</span>
                      <span>{item.text}</span>
                    </div>
                  );
                }
                
                if (item.type === 'text') {
                  return (
                    <p key={itemIdx} style={{
                      margin: '8px 0',
                      fontSize: '11pt',
                      color: '#333'
                    }}>
                      {item.text}
                    </p>
                  );
                }
                
                return null;
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Professional Footer */}
      <div className="plan-footer" style={{
        borderTop: `2px solid ${primaryColor}`,
        paddingTop: '15px',
        marginTop: '40px',
        fontSize: '9pt',
        color: '#666',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '10pt', color: '#333' }}>
          {clinicName}
        </div>
        {email && (
          <div style={{ marginBottom: '5px' }}>
            Email: {email}
          </div>
        )}
        {phone && (
          <div style={{ marginBottom: '5px' }}>
            Phone: {phone}
          </div>
        )}
        {website && (
          <div style={{ marginBottom: '5px' }}>
            Website: {website}
          </div>
        )}
        {address && (
          <div style={{ marginBottom: '5px' }}>
            Address: {address}
          </div>
        )}
        <div style={{ marginTop: '10px', fontSize: '8pt', fontStyle: 'italic' }}>
          This nutrition plan is prepared by a qualified dietitian and is intended for the specific individual named above.
          Please consult your healthcare provider before making significant dietary changes.
        </div>
      </div>
    </div>
  );
}
