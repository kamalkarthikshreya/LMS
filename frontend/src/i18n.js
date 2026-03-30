import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "welcome": "Welcome back Master! 👋",
      "dashboard": "Dashboard",
      "courses": "My Courses",
      "assessments": "Assessments",
      "progress": "Analytics",
      "enrolled": "Enrolled",
      "proficiency": "Avg Proficiency",
      "logout": "Logout",
      "enroll": "Enroll in Program",
      "resume": "Resume Session",
      "mastery": "Mastery Level",
      "catalog": "Global Catalog",
      "continuing": "Continuing Education",
      "analytics": "Mastery Progress",
      "scholar_id": "Scholar ID",
      "active_courses": "You're currently mastering {{count}} professional courses.",
      "no_enrollments": "Your curriculum is currently empty. Explore courses to begin.",
      "start_eval": "Start Evaluation",
      "flag_wrong": "Flag Incorrect Answer",
      "ask_ai": "Ask your scholar assistant...",
      "translate": "Translate Content",
      "global_catalog": "Global Catalog"
    }
  },
  kn: {
    translation: {
      "welcome": "ನಿಮಗೆ ಸ್ವಾಗತ ಮಾಸ್ಟರ್! 👋",
      "dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      "courses": "ನನ್ನ ಕೋರ್ಸ್‌ಗಳು",
      "assessments": "ಮೌಲ್ಯಮಾಪನಗಳು",
      "progress": "ವಿಶ್ಲೇಷಣೆ",
      "enrolled": "ದಾಖಲಾಗಿರುವ",
      "proficiency": "ಸರಾಸರಿ ಪ್ರಾವೀಣ್ಯತೆ",
      "logout": "ನಿರ್ಗಮನ",
      "enroll": "ಕಾರ್ಯಕ್ರಮಕ್ಕೆ ದಾಖಲಾಗಿ",
      "resume": "ಸೆಶನ್ ಮುಂದುವರಿಸಿ",
      "mastery": "ಪಾಂಡಿತ್ಯದ ಮಟ್ಟ",
      "catalog": "ಜಾಗತಿಕ ಕ್ಯಾಟಲಾಗ್",
      "continuing": "ಮುಂದುವರಿದ ಶಿಕ್ಷಣ",
      "analytics": "ಪಾಂಡಿತ್ಯದ ಪ್ರಗತಿ",
      "scholar_id": "ವಿದ್ವಾಂಸ ಐಡಿ",
      "active_courses": "ನೀವು {{count}} ವೃತ್ತಿಪರ ಕೋರ್ಸ್‌ಗಳನ್ನು ಕಲಿಯುತ್ತಿದ್ದೀರಿ.",
      "no_enrollments": "ನಿಮ್ಮ ಪಠ್ಯಕ್ರಮವು ಖಾಲಿಯಾಗಿದೆ. ಪ್ರಾರಂಭಿಸಲು ಕೋರ್ಸ್‌ಗಳನ್ನು ಅನ್ವೇಷಿಸಿ.",
      "start_eval": "ಮೌಲ್ಯಮಾಪನ ಪ್ರಾರಂಭಿಸಿ",
      "flag_wrong": "ತಪ್ಪು ಉತ್ತರವನ್ನು ಗುರುತಿಸಿ",
      "ask_ai": "ನಿಮ್ಮ ವಿದ್ವಾಂಸ ಸಹಾಯಕನನ್ನು ಕೇಳಿ...",
      "translate": "ವಿಷಯವನ್ನು ಅನುವಾದಿಸಿ",
      "global_catalog": "ಜಾಗತಿಕ ಕ್ಯಾಟಲಾಗ್"
    }
  },
  hi: {
    translation: {
      "welcome": "वापसी पर स्वागत है मास्टर! 👋",
      "dashboard": "डैशबोर्ड",
      "courses": "मेरे पाठ्यक्रम",
      "assessments": "मूल्यांकन",
      "progress": "विश्लेषण",
      "enrolled": "नामांकित",
      "proficiency": "औसत प्रवीणता",
      "logout": "लॉग आउट",
      "enroll": "कार्यक्रम में नामांकन करें",
      "resume": "सत्र फिर से शुरू करें",
      "mastery": "महारत का स्तर",
      "catalog": "वैश्विक कैटलॉग",
      "continuing": "सतत शिक्षा",
      "analytics": "महारत की प्रगति",
      "scholar_id": "स्कॉलर आईडी",
      "active_courses": "आप {{count}} पेशेवर पाठ्यक्रमों में महारत हासिल कर रहे हैं।",
      "no_enrollments": "आपका पाठ्यक्रम वर्तमान में खाली है। शुरू करने के लिए पाठ्यक्रम खोजें।",
      "start_eval": "मूल्यांकन शुरू करें",
      "flag_wrong": "गलत उत्तर को चिह्नित करें",
      "ask_ai": "अपने स्कॉलर सहायक से पूछें...",
      "translate": "सामग्री का अनुवाद करें",
      "global_catalog": "वैश्विक कैटलॉग"
    }
  },
  te: {
    translation: {
      "welcome": "తిరిగి స్వాగతం మాస్టర్! 👋",
      "dashboard": "డాష్‌బోర్డ్",
      "courses": "నా కోర్సులు",
      "assessments": "అంచనాలు",
      "progress": "విశ్లేషణ",
      "enrolled": "చేరినవి",
      "proficiency": "సగటు నైపుణ్యం",
      "logout": "లాగ్ అవుట్",
      "enroll": "ప్రోగ్రామ్‌లో చేరండి",
      "resume": "సెషన్‌ను తిరిగి ప్రారంభించండి",
      "mastery": "నైపుణ్యం స్థాయి",
      "catalog": "గ్లోబల్ క్యాటలాగ్",
      "continuing": "కొనసాగుతున్న విద్య",
      "analytics": "నైపుణ్యం పురోగతి",
      "scholar_id": "స్కాలర్ ఐడి",
      "active_courses": "మీరు {{count}} వృత్తిపరమైన కోర్సుల్లో నైపుణ్యం సాధిస్తున్నారు.",
      "no_enrollments": "మీ పాఠ్యప్రణాళిక ప్రస్తుతం ఖాళీగా ఉంది. ప్రారంభించడానికి కోర్సులను అన్వేషించండి.",
      "start_eval": "అంచనాను ప్రారంభించండి",
      "flag_wrong": "తప్పు సమాధానాన్ని ఫ్లాగ్ చేయండి",
      "ask_ai": "మీ స్కాలర్ అసిస్టెంట్‌ని అడగండి...",
      "translate": "కంటెంట్‌ని అనువదించండి",
      "global_catalog": "గ్లోబల్ క్యాటలాగ్"
    }
  },
  mr: {
    translation: {
      "welcome": "परत स्वागत आहे मास्टर! 👋",
      "dashboard": "डॅशबोर्ड",
      "courses": "माझे अभ्यासक्रम",
      "assessments": "मूल्यमापन",
      "progress": "विश्लेषण",
      "enrolled": "नोंदणीकृत",
      "proficiency": "सरासरी नैपुण्य",
      "logout": "लॉग आउट",
      "enroll": "कार्यक्रमात नाव नोंदवा",
      "resume": "सत्र पुन्हा सुरू करा",
      "mastery": "नैपुण्य पातळी",
      "catalog": "जागतिक कॅटलॉग",
      "continuing": "सतत शिक्षण",
      "analytics": "नैपुण्य प्रगती",
      "scholar_id": "स्कॉलर आयडी",
      "active_courses": "तुम्ही {{count}} व्यावसायिक अभ्यासक्रमांमध्ये नैपुण्य मिळवत आहात.",
      "no_enrollments": "तुमचा अभ्यासक्रम सध्या रिकामा आहे. सुरू करण्यासाठी अभ्यासक्रम शोधा.",
      "start_eval": "मूल्यमापन सुरू करा",
      "flag_wrong": "चुकीचे उत्तर चिन्हांकित करा",
      "ask_ai": "तुमच्या स्कॉलर सहाय्यकाला विचारा...",
      "translate": "सामग्री अनुवादित करा",
      "global_catalog": "जागतिक कॅटलॉग"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
