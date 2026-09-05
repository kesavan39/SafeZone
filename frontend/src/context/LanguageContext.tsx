import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ta' | 'hi';

const DEFAULT_TRANSLATIONS: Record<Language, Record<string, any>> = {
  en: {
    app_title: "Dynamic Human–Robot Safety Zone Simulator",
    nav: {
      dashboard: "Dashboard",
      layout_editor: "Layout Builder",
      simulation: "Simulation Studio",
      scenario_lab: "Scenario Lab",
      sensitivity: "Sensitivity Analysis",
      reports: "Reports & Feedback"
    },
    status: {
      safe: "SAFE",
      warning: "WARNING",
      high_risk: "HIGH RISK",
      critical: "CRITICAL STOP"
    },
    dashboard: {
      active_projects: "Active Projects",
      unsafe_events: "Unsafe Events",
      safety_score: "Safety Score",
      robot_stops: "Robot Halts",
      downtime_saved: "Downtime Reduced",
      recent_simulations: "Recent Simulation Runs"
    },
    layout: {
      title: "Factory Workcell Layout Builder",
      add_robot: "Add Robot",
      add_human: "Add Human Station",
      add_conveyor: "Add Conveyor",
      add_obstacle: "Add Safety Pillar",
      clear: "Clear Canvas",
      save: "Save Layout to Supabase"
    },
    simulation: {
      title: "Real-Time Dynamic Safety Zone Studio",
      start: "Start Simulation",
      pause: "Pause",
      reset: "Reset",
      speed: "Speed Multiplier",
      explainability: "Why Is This Unsafe?",
      actual_dist: "Actual Distance",
      req_sep: "Required Separation",
      confidence: "System Confidence"
    }
  },
  ta: {
    app_title: "டைனமிக் மனித-ரோபோ பாதுகாப்பு மண்டல உருவகப்படுத்துதல்",
    nav: {
      dashboard: "முகப்பு பலகை",
      layout_editor: "வரைபட தயாரிப்பாளர்",
      simulation: "உருவகப்படுத்துதல் மையம்",
      scenario_lab: "சூழ்நிலை கூடம்",
      sensitivity: "உணர்திறன் பகுப்பாய்வு",
      reports: "அறிக்கைகள் & கருத்து"
    },
    status: {
      safe: "பாதுகாப்பானது",
      warning: "எச்சரிக்கை",
      high_risk: "அதிக அபாயம்",
      critical: "உடனடி நிறுத்தம்"
    },
    dashboard: {
      active_projects: "செயலில் உள்ள திட்டங்கள்",
      unsafe_events: "பாதுகாப்பற்ற நிகழ்வுகள்",
      safety_score: "பாதுகாப்பு மதிப்பெண்",
      robot_stops: "ரோபோ நிறுத்தங்கள்",
      downtime_saved: "குறைக்கப்பட்ட நேர இழப்பு",
      recent_simulations: "சமீபத்திய உருவகப்படுத்துதல்கள்"
    },
    layout: {
      title: "தொழிற்சாலை தள வரைபடக் கருவி",
      add_robot: "ரோபோவைச் சேர்",
      add_human: "மனிதப் பணியிடத்தைச் சேர்",
      add_conveyor: "கன்வேயரைச் சேர்",
      add_obstacle: "தடைச் சுவரைச் சேர்",
      clear: "அழி",
      save: "சேமி"
    },
    simulation: {
      title: "நிகழ்நேர பாதுகாப்பு மண்டல அரங்கம்",
      start: "தொடங்கு",
      pause: "நிறுத்து",
      reset: "மீட்டமை",
      speed: "வேகப் பெருக்கி",
      explainability: "இது ஏன் அபாயகரமானது?",
      actual_dist: "தற்போதைய தூரம்",
      req_sep: "தேவையான இடைவெளி",
      confidence: "நம்பகத்தன்மை"
    }
  },
  hi: {
    app_title: "डायनामिक मानव-रोबोट सुरक्षा क्षेत्र सिम्युलेटर",
    nav: {
      dashboard: "डैशबोर्ड",
      layout_editor: "लेआउट बिल्डर",
      simulation: "सिमुलेशन स्टूडियो",
      scenario_lab: "परिदृश्य प्रयोगशाला",
      sensitivity: "संवेदनशीलता विश्लेषण",
      reports: "रिपोर्ट और प्रतिक्रिया"
    },
    status: {
      safe: "सुरक्षित",
      warning: "चेतावनी",
      high_risk: "उच्च जोखिम",
      critical: "आपातकालीन रोक"
    },
    dashboard: {
      active_projects: "सक्रिय परियोजनाएं",
      unsafe_events: "असुरक्षित घटनाएं",
      safety_score: "सुरक्षा स्कोर",
      robot_stops: "रोबोट रोक",
      downtime_saved: "कम हुआ समय नुकसान",
      recent_simulations: "हाल के सिमुलेशन"
    },
    layout: {
      title: "फ़ैक्टरी लेआउट बिल्डर",
      add_robot: "रोबोट जोड़ें",
      add_human: "मानव स्टेशन जोड़ें",
      add_conveyor: "कन्वेयर जोड़ें",
      add_obstacle: "सुरक्षा स्तंभ जोड़ें",
      clear: "साफ़ करें",
      save: "सहेजें"
    },
    simulation: {
      title: "रियल-टाइम सुरक्षा क्षेत्र स्टूडियो",
      start: "प्रारंभ करें",
      pause: "रोकें",
      reset: "रीसेट",
      speed: "गति गुणक",
      explainability: "यह असुरक्षित क्यों है?",
      actual_dist: "वास्तविक दूरी",
      req_sep: "आवश्यक दूरी",
      confidence: "विश्वास स्तर"
    }
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, any>>(DEFAULT_TRANSLATIONS.en);

  useEffect(() => {
    if (DEFAULT_TRANSLATIONS[language]) {
      setTranslations(DEFAULT_TRANSLATIONS[language]);
    }
  }, [language]);

  const t = (path: string): string => {
    const keys = path.split('.');
    let current: any = translations;
    for (const k of keys) {
      if (current && current[k] !== undefined) {
        current = current[k];
      } else {
        return path;
      }
    }
    return typeof current === 'string' ? current : path;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
