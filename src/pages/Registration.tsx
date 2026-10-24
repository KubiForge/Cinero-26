import React, { useState, useId } from 'react';
import './Registration.css';
import BrandLogo from '../components/BrandLogo';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

interface RegistrationPageProps {
  onBack: () => void;
}

export interface TeamMember {
  name: string;
  gradeOrYear: string;
  phone: string;
  institution: string;
}

const SRI_LANKA_DISTRICTS = [
  'Ampara',
  'Anuradhapura',
  'Badulla',
  'Batticaloa',
  'Colombo',
  'Galle',
  'Gampaha',
  'Hambantota',
  'Jaffna',
  'Kalutara',
  'Kandy',
  'Kegalle',
  'Kilinochchi',
  'Kurunegala',
  'Mannar',
  'Matale',
  'Matara',
  'Monaragala',
  'Mullaitivu',
  'Nuwara Eliya',
  'Polonnaruwa',
  'Puttalam',
  'Ratnapura',
  'Trincomalee',
  'Vavuniya',
];

const UNIVERSITIES_LIST = [
  'University of Sri Jayewardenepura',
  'University of Colombo',
  'University of Moratuwa',
  'University of Peradeniya',
  'University of Kelaniya',
  'University of Ruhuna',
  'University of Jaffna',
  'Eastern University, Sri Lanka',
  'South Eastern University of Sri Lanka',
  'Rajarata University of Sri Lanka',
  'Sabaragamuwa University of Sri Lanka',
  'Wayamba University of Sri Lanka',
  'Uva Wellassa University',
  'University of the Visual and Performing Arts',
  'Gampaha Wickramarachchi University of Indigenous Medicine',
  'University of Vavuniya',
  'Open University of Sri Lanka',
  'General Sir John Kotelawala Defence University (KDU)',
  'Ocean University of Sri Lanka',
  'SLIIT (Sri Lanka Institute of Information Technology)',
  'NSBM Green University',
  'IIT (Informatics Institute of Technology)',
  'CINEC Campus',
  'Horizon Campus',
  'Royal Institute Colombo (RIC)',
  'NIBM (National Institute of Business Management)',
  'Other',
];

const SCHOOL_GRADES = [
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11 (O/L)',
  'Grade 12 (A/L)',
  'Grade 13 (A/L)',
];

const UNIVERSITY_YEARS = [
  'First Year (1st Year)',
  'Second Year (2nd Year)',
  'Third Year (3rd Year)',
  'Final Year (4th Year / Final)',
];

const HEAR_SOURCES = [
  'Instagram',
  'Facebook',
  'TikTok',
  'YouTube',
  'WhatsApp',
  'School or university',
  'Friend or teammate',
  'Poster or flyer',
  'Other',
];

export const RegistrationPage: React.FC<RegistrationPageProps> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const studentIdInputId = useId();
  const paymentSlipInputId = useId();

  // Category
  const [category, setCategory] = useState<'school' | 'university'>('university');

  // Step 1: Team details
  const [teamName, setTeamName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [teamSize, setTeamSize] = useState<number>(4);
  const [members, setMembers] = useState<TeamMember[]>([
    { name: '', gradeOrYear: '', phone: '', institution: '' },
    { name: '', gradeOrYear: '', phone: '', institution: '' },
    { name: '', gradeOrYear: '', phone: '', institution: '' },
  ]);

  // Step 2: Category specifics
  // School
  const [schoolName, setSchoolName] = useState('');
  const [district, setDistrict] = useState('Colombo');
  const [leaderGrade, setLeaderGrade] = useState('Grade 12 (A/L)');
  const [teacherName, setTeacherName] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [guardianDetails, setGuardianDetails] = useState('');
  const [parentConsent, setParentConsent] = useState(false);

  // University
  const [university, setUniversity] = useState('University of Sri Jayewardenepura');
  const [customUniversity, setCustomUniversity] = useState('');
  const [faculty, setFaculty] = useState('');
  const [degree, setDegree] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('Second Year (2nd Year)');
  const [studentRegNo, setStudentRegNo] = useState('');
  const [studentIdFile, setStudentIdFile] = useState<File | null>(null);
  const [studentIdFileName, setStudentIdFileName] = useState('');
  const [universityEligibility, setUniversityEligibility] = useState(false);

  // Step 3: Payment
  const [paymentMethod, setPaymentMethod] = useState<'Bank deposit' | 'Online transfer' | 'Other'>('Online transfer');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentSlipFile, setPaymentSlipFile] = useState<File | null>(null);
  const [paymentSlipFileName, setPaymentSlipFileName] = useState('');

  // Step 4: Declarations & Feedback
  const [acceptRules, setAcceptRules] = useState(false);
  const [productionDateAccuracy, setProductionDateAccuracy] = useState(false);
  const [copyrightCleared, setCopyrightCleared] = useState(false);
  const [useOfInfo, setUseOfInfo] = useState(false);
  const [signature, setSignature] = useState('');
  const [questions, setQuestions] = useState('');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceId, setReferenceId] = useState('');

  // Calculated Registration Fee
  const calculatedFee = category === 'school' ? 2000 : 1000 * teamSize;

  // Handle Team Size Change and adjust member rows
  const handleTeamSizeChange = (newSize: number) => {
    setTeamSize(newSize);
    const requiredAdditionalMembers = Math.max(0, newSize - 1);
    setMembers((prev) => {
      const next = [...prev];
      if (next.length < requiredAdditionalMembers) {
        while (next.length < requiredAdditionalMembers) {
          next.push({ name: '', gradeOrYear: '', phone: '', institution: '' });
        }
      } else if (next.length > requiredAdditionalMembers) {
        return next.slice(0, requiredAdditionalMembers);
      }
      return next;
    });
  };

  const handleMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    setMembers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSourceToggle = (source: string) => {
    setSelectedSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    );
  };

  // Step Validations
  const validateStep1 = (): boolean => {
    if (!teamName.trim()) {
      void Swal.fire({ title: 'Missing Team Name', text: 'Please enter your team name.', icon: 'warning', background: '#171518', color: '#fff', confirmButtonColor: '#d4a642' });
      return false;
    }
    if (!leaderName.trim()) {
      void Swal.fire({ title: 'Missing Leader Name', text: "Please enter the team leader's full name.", icon: 'warning', background: '#171518', color: '#fff', confirmButtonColor: '#d4a642' });
      return false;
    }
    const phoneRegex = /^(?:0|94|\+94)?7[0-9]{8}$/;
    if (!phoneRegex.test(leaderPhone.replace(/\s+/g, ''))) {
      void Swal.fire({ title: 'Invalid Mobile Number', text: 'Please enter a valid mobile number (e.g. 07XXXXXXXX).', icon: 'warning', background: '#171518', color: '#fff', confirmButtonColor: '#d4a642' });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leaderEmail.trim())) {
      void Swal.fire({ title: 'Invalid Email Address', text: 'Please enter a valid email address.', icon: 'warning', background: '#171518', color: '#fff', confirmButtonColor: '#d4a642' });
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (category === 'school') {
      if (!schoolName.trim()) {
        void Swal.fire({ title: 'Missing School Name', text: 'Please enter the name of your school.', icon: 'warning', background: '#171518', color: '#fff', confirmButtonColor: '#d4a642' });
        return false;
      }
      if (!teacherName.trim()) {
        void Swal.fire({ title: 'Missing Teacher-in-Charge', text: 'Please enter the full name of the teacher in charge.', icon: 'warning', background: '#171518', color: '#fff', confirmButtonColor: '#d4a642' });
        return false;
      }
      if (!teacherPhone.trim()) {
        void Swal.fire({ title: 'Missing Teacher Contact', text: 'Please enter the mobile number of the teacher in charge.', icon: 'warning', background: '#171518', color: '#fff', confirmButtonColor: '#d4a642' });
        return false;
      }
      if (!guardianDetails.trim()) {
        void Swal.fire({ title: 'Missing Parent Details', text: "Please enter the team leader's parent or guardian name and mobile number.", icon: 'warning', background: '#171518', color: '#fff', confirmButtonColor: '#d4a642' });
        return false;
      }
      if (!parentConsent) {
        void Swal.fire({ title: 'Parent or Guardian Consent Required', text: 'Please tick the box to confirm parent or guardian consent for team members under 18.', icon: 'warning', background: '#171518', color: '#fff', confirmButtonColor: '#d4a642' });
        return false;
      }
    } else {
      if (university === 'Other' && !customUniversity.trim()) {
        void Swal.fire({ title: 'Missing Institution Name', text: 'Please specify your university or higher education institution.', icon: 'warning', background: '#171518', color: '#fff', confirmButtonColor: '#d4a642' });
        return false;
      }
      if (!faculty.trim()) {
        void Swal.fire({ title: 'Missing Faculty', text: 'Please enter your faculty.', icon: 'warning', background: '#171518', color: '#fff', confirmButtonColor: '#d4a642' });
        return false;
      }
      if (!degree.trim()) {
        void Swal.fire({ title: 'Missing Degree Programme', text: 'Please enter your degree programme.', icon: 'warning', background: '#171518', color: '#fff', confirmButtonColor: '#d4a642' });
        return false;
      }
      if (!studentRegNo.trim()) {
        void Swal.fire({ title: 'Missing Student Reg. Number', text: 'Please enter your student registration number.', icon: 'warning', background: '#171518', color: '#fff', confirmButtonColor: '#d4a642' });
        return false;
      }
      if (!studentIdFile) {
        void Swal.fire({ title: 'Student ID Required', text: "Please upload a photo or scan of the team leader's student ID.", icon: 'warning', background: '#171518', color: '#fff', confirmButtonColor: '#d4a642' });
        return false;
      }
      if (!universityEligibility) {
        void Swal.fire({ title: 'Eligibility Confirmation Required', text: 'Please tick the box to confirm that all team members are currently enrolled undergraduates.', icon: 'warning', background: '#171518', color: '#fff', confirmButtonColor: '#d4a642' });
        return false;
      }
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    if (!paymentDate) {
      void Swal.fire({ title: 'Missing Payment Date', text: 'Please select the date of payment.', icon: 'warning', background: '#171518', color: '#fff', confirmButtonColor: '#d4a642' });
      return false;
    }
    if (!paymentSlipFile) {
      void Swal.fire({ title: 'Payment Slip Required', text: 'Please upload the payment slip or receipt image/PDF.', icon: 'warning', background: '#171518', color: '#fff', confirmButtonColor: '#d4a642' });
      return false;
    }
    return true;
  };

  const validateStep4 = (): boolean => {
    if (!acceptRules || !productionDateAccuracy || !copyrightCleared || !useOfInfo) {
      void Swal.fire({ title: 'Declarations Required', text: 'Please tick all four declaration boxes before continuing.', icon: 'warning', background: '#171518', color: '#fff', confirmButtonColor: '#d4a642' });
      return false;
    }
    if (!signature.trim()) {
      void Swal.fire({ title: 'Missing Confirmation Signature', text: "Please type the team leader's full name to confirm the submission.", icon: 'warning', background: '#171518', color: '#fff', confirmButtonColor: '#d4a642' });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;

    setCurrentStep((prev) => Math.min(5, prev + 1));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const fileToBase64 = (file: File): Promise<{ base64: string; mime: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1] || '';
        resolve({ base64, mime: file.type || 'application/octet-stream' });
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep4()) return;

    setIsSubmitting(true);

    const generatedRef = `CNR26-${category === 'school' ? 'SCH' : 'UNI'}-${Math.floor(1000 + Math.random() * 9000)}`;

    const otherMembersText = members
      .filter((m) => m.name.trim() !== '')
      .map((m, i) => `${i + 2}. ${m.name} | ${m.gradeOrYear || '-'} | ${m.phone || '-'} | ${m.institution || '-'}`)
      .join('\n');

    let studentIdBase64 = '';
    let studentIdMime = '';
    if (studentIdFile) {
      try {
        const converted = await fileToBase64(studentIdFile);
        studentIdBase64 = converted.base64;
        studentIdMime = converted.mime;
      } catch (err) {
        console.warn('Could not encode student ID to base64:', err);
      }
    }

    let paymentSlipBase64 = '';
    let paymentSlipMime = '';
    if (paymentSlipFile) {
      try {
        const converted = await fileToBase64(paymentSlipFile);
        paymentSlipBase64 = converted.base64;
        paymentSlipMime = converted.mime;
      } catch (err) {
        console.warn('Could not encode payment slip to base64:', err);
      }
    }

    const payload = {
      timestamp: new Date().toLocaleString(),
      referenceId: generatedRef,
      category: category === 'school' ? 'Inter-School Category' : 'Inter-University Category',
      teamName: teamName.trim(),
      leaderName: leaderName.trim(),
      leaderPhone: leaderPhone.trim(),
      leaderEmail: leaderEmail.trim(),
      teamSize,
      otherMembers: otherMembersText || 'None',
      institution: category === 'school' ? schoolName.trim() : (university === 'Other' ? customUniversity.trim() : university),
      districtOrFaculty: category === 'school' ? district : faculty.trim(),
      gradeOrYear: category === 'school' ? leaderGrade : yearOfStudy,
      teacherOrRegNo: category === 'school' ? `${teacherName.trim()} (${teacherPhone.trim()})` : studentRegNo.trim(),
      guardianOrDegree: category === 'school' ? guardianDetails.trim() : degree.trim(),
      consentOrEligibility: category === 'school'
        ? `Parent/guardian consent: ${parentConsent ? 'Yes' : 'No'}; Declarations accepted: Yes`
        : `Undergraduate eligibility: ${universityEligibility ? 'Yes' : 'No'}; Declarations accepted: Yes`,
      amountPaid: calculatedFee,
      paymentMethod,
      paymentDate,
      paymentRef: paymentRef.trim() || 'N/A',
      studentIdFileName: studentIdFileName || 'N/A',
      studentIdBase64,
      studentIdMime,
      paymentSlipFileName: paymentSlipFileName || 'N/A',
      paymentSlipBase64,
      paymentSlipMime,
      signature: signature.trim(),
      questions: questions.trim() || 'None',
      heardFrom: selectedSources.join(', ') || 'N/A',
    };


    const apiUrl = '/api/registration';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.message || 'Your registration could not be saved.'
        );
      }

      // Show success only after the backend confirms the save.
      setReferenceId(generatedRef);
      setIsSubmitting(false);
      setCurrentStep(5);
      window.scrollTo({ top: 80, behavior: 'smooth' });

      await Swal.fire({
        title: 'Registration Successful!',
        text: `Your team "${teamName}" has been submitted successfully. Your reference ID is ${generatedRef}.`,
        icon: 'success',
        confirmButtonText: 'View Summary',
        confirmButtonColor: '#d4a642',
        background: '#171518',
        color: '#fff',
      });
    } catch (error: any) {
      console.error('Registration submission failed:', error);

      setIsSubmitting(false);

      await Swal.fire({
        title: 'Registration Failed',
        text: error?.message || 'We could not confirm your registration. Your details may not have been saved. Please try again.',
        icon: 'error',
        confirmButtonText: 'Try Again',
        confirmButtonColor: '#d4a642',
        background: '#171518',
        color: '#fff',
      });
    }
  };

  return (
    <div className="reg-page">
      {/* Background visual art */}
      <div className="reg-page__bg-wrapper" aria-hidden="true">
        <img
          src="/images/background%20for%20registration%20section%20and%20page.png"
          alt=""
          className="reg-page__bg-img"
        />
        <div className="reg-page__bg-overlay" />
      </div>

      {/* Header bar with Back button & Logo */}
      <header className="reg-page__header">
        <div className="reg-page__header-inner">
          <button type="button" className="reg-page__back-btn" onClick={onBack} aria-label="Back to Home">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span className="reg-page__back-text-full">Back to Home</span>
            <span className="reg-page__back-text-short">Back</span>
          </button>

          <div className="reg-page__logo-link">
            <BrandLogo
              variant="withoutCaption"
              sizes="160px"
              alt="CINERO'26"
              className="reg-page__logo-img"
              decoding="async"
            />
          </div>
        </div>
      </header>

      <section className="reg-hero">
        <picture className="reg-hero__background" aria-hidden="true">
          <source
            type="image/webp"
            media="(max-width: 480px)"
            srcSet="/images/registration-background-480.webp"
            sizes="100vw"
          />
          <source
            type="image/webp"
            srcSet="/images/registration-background-960.webp 960w, /images/registration-background-1600.webp 1600w"
            sizes="100vw"
          />
          <img
            src="/images/registration-background-1600.webp"
            alt=""
            width={1600}
            height={900}
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <div className="reg-hero__overlay" aria-hidden="true" />
        <div className="reg-hero__content">
          <div className="reg-hero__eyebrow">CINERO’26 TEAM REGISTRATION</div>
          <h1 className="reg-hero__title">Register Your Team</h1>
          <p className="reg-hero__desc">
            Join CINERO’26 and bring your story to the screen. Registration is open from{' '}
            <strong>October 26 to November 7, 2026</strong>.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <main className="reg-page__main">

        {/* Stepper (Only active if not in confirmation step) */}
        {currentStep < 5 && (
          <nav className="reg-stepper" aria-label="Registration Progress">
            <div
              className="reg-stepper__progress-line"
              style={{ width: `${((currentStep - 1) / 3) * 75}%` }}
              aria-hidden="true"
            />
            {[
              { num: 1, label: 'Team Details' },
              { num: 2, label: category === 'school' ? 'School Info' : 'University Info' },
              { num: 3, label: 'Fee & Payment' },
              { num: 4, label: 'Declarations' },
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isCompleted = currentStep > step.num;
              return (
                <button
                  key={step.num}
                  type="button"
                  className={`reg-step-item ${isActive ? 'is-active' : ''} ${isCompleted ? 'is-completed' : ''}`}
                  onClick={() => {
                    if (isCompleted) setCurrentStep(step.num);
                  }}
                  disabled={!isCompleted && !isActive}
                >
                  <div className="reg-step-item__circle">
                    {step.num}
                  </div>
                  <span className="reg-step-item__label">{step.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* FORM CONTENT */}
        <form id="registration-form" onSubmit={handleSubmit} noValidate>
          {/* ================= STEP 1: CATEGORY & TEAM DETAILS ================= */}
          {currentStep === 1 && (
            <div className="reg-card">
              <div className="reg-card__header">
                <span className="reg-card__step-tag">Step 01 of 04</span>
                <h2 className="reg-card__title">Category & Team Details</h2>
                <p className="reg-card__subtitle">
                  Select your competition category and provide the primary contact details for your filmmaking crew.
                </p>
              </div>

              {/* Category Selector */}
              <div className="reg-field reg-field--full" style={{ marginBottom: '1.25rem' }}>
                <span className="reg-label">
                  Which category are you registering for? <span className="reg-label__required">*</span>
                </span>
                <div className="reg-category-options">
                  <div
                    className={`reg-cat-card ${category === 'university' ? 'is-selected' : ''}`}
                    onClick={() => setCategory('university')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') setCategory('university'); }}
                  >
                    <div className="reg-cat-card__header">
                      <span className="reg-cat-card__badge">Higher Education</span>
                      <span className="reg-cat-card__radio" />
                    </div>
                    <h3 className="reg-cat-card__title">Inter-University Category</h3>
                    <p className="reg-cat-card__desc">
                      Open to undergraduates of state and recognised private universities/institutions across Sri Lanka.
                    </p>
                    <div className="reg-cat-card__fee">
                      Fee: Rs. 1,000 per student in team
                    </div>
                  </div>

                  <div
                    className={`reg-cat-card ${category === 'school' ? 'is-selected' : ''}`}
                    onClick={() => setCategory('school')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') setCategory('school'); }}
                  >
                    <div className="reg-cat-card__header">
                      <span className="reg-cat-card__badge">Schools Islandwide</span>
                      <span className="reg-cat-card__radio" />
                    </div>
                    <h3 className="reg-cat-card__title">Inter-School Category</h3>
                    <p className="reg-cat-card__desc">
                      Open to students in Grades 6 to 13 at government, private, and international schools in Sri Lanka.
                    </p>
                    <div className="reg-cat-card__fee">
                      Fee: Rs. 2,000 flat per school team
                    </div>
                  </div>
                </div>
              </div>

              <div className="reg-form-grid reg-form-grid--2col">
                <div className="reg-field">
                  <label htmlFor="reg-team-name" className="reg-label">
                    Team Name <span className="reg-label__required">*</span>
                  </label>
                  <input
                    id="reg-team-name"
                    type="text"
                    className="reg-input"
                    placeholder="e.g. CineVibe Productions"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                  />
                </div>

                <div className="reg-field">
                  <label htmlFor="reg-leader-name" className="reg-label">
                    Team Leader's Full Name <span className="reg-label__required">*</span>
                  </label>
                  <input
                    id="reg-leader-name"
                    type="text"
                    className="reg-input"
                    placeholder="e.g. Kasun Kalhara Perera"
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    required
                  />
                </div>

                <div className="reg-field">
                  <label htmlFor="reg-leader-phone" className="reg-label">
                    Leader's Mobile Number (WhatsApp preferred) <span className="reg-label__required">*</span>
                  </label>
                  <input
                    id="reg-leader-phone"
                    type="tel"
                    className="reg-input"
                    placeholder="07XXXXXXXX"
                    value={leaderPhone}
                    onChange={(e) => setLeaderPhone(e.target.value)}
                    required
                  />
                  <span className="reg-hint">Used for official communications and film submission access notices.</span>
                </div>

                <div className="reg-field">
                  <label htmlFor="reg-leader-email" className="reg-label">
                    Team Leader's Email Address <span className="reg-label__required">*</span>
                  </label>
                  <input
                    id="reg-leader-email"
                    type="email"
                    className="reg-input"
                    placeholder="leader@gmail.com"
                    value={leaderEmail}
                    onChange={(e) => setLeaderEmail(e.target.value)}
                    required
                  />
                  <span className="reg-hint">Submission links will be delivered to this email.</span>
                </div>

                <div className="reg-field reg-field--full">
                  <label htmlFor="reg-team-size" className="reg-label">
                    How many members are in your team, including the team leader? <span className="reg-label__required">*</span>
                  </label>
                  <select
                    id="reg-team-size"
                    className="reg-select"
                    value={teamSize}
                    onChange={(e) => handleTeamSizeChange(Number(e.target.value))}
                  >
                    {[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((num) => (
                      <option key={num} value={num}>
                        {num} members {category === 'university' ? `(Registration fee: Rs. ${num * 1000})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Other Team Members */}
              {members.length > 0 && (
                <div className="reg-members-box">
                  <div className="reg-members-box__header">
                    <span className="reg-members-box__title">
                      Other Team Members ({members.length})
                    </span>
                    <span className="reg-hint">
                      Add full name, grade/year of study, mobile number, and institution.
                    </span>
                  </div>

                  {members.map((member, idx) => (
                    <div key={idx} className="reg-member-row">
                      <div className="reg-field">
                        <label htmlFor={`member-name-${idx}`} className="reg-label">
                          <span className="reg-member-row__num">Member #{idx + 2} Full Name</span>
                        </label>
                        <input
                          id={`member-name-${idx}`}
                          type="text"
                          className="reg-input"
                          placeholder="Full Name"
                          value={member.name}
                          onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                        />
                      </div>

                      <div className="reg-field">
                        <label htmlFor={`member-grade-${idx}`} className="reg-label">
                          <span className="reg-member-row__num">Grade / Year</span>
                        </label>
                        <input
                          id={`member-grade-${idx}`}
                          type="text"
                          className="reg-input"
                          placeholder={category === 'school' ? 'e.g. Grade 12' : 'e.g. 2nd Year'}
                          value={member.gradeOrYear}
                          onChange={(e) => handleMemberChange(idx, 'gradeOrYear', e.target.value)}
                        />
                      </div>

                      <div className="reg-field">
                        <label htmlFor={`member-phone-${idx}`} className="reg-label">
                          <span className="reg-member-row__num">Mobile No</span>
                        </label>
                        <input
                          id={`member-phone-${idx}`}
                          type="tel"
                          className="reg-input"
                          placeholder="07XXXXXXXX"
                          value={member.phone}
                          onChange={(e) => handleMemberChange(idx, 'phone', e.target.value)}
                        />
                      </div>

                      <div className="reg-field">
                        <label htmlFor={`member-inst-${idx}`} className="reg-label">
                          <span className="reg-member-row__num">School / Univ.</span>
                        </label>
                        <input
                          id={`member-inst-${idx}`}
                          type="text"
                          className="reg-input"
                          placeholder="Institution Name"
                          value={member.institution}
                          onChange={(e) => handleMemberChange(idx, 'institution', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="reg-actions">
                <button type="button" className="reg-btn reg-btn--prev" onClick={onBack}>
                  Cancel
                </button>
                <button type="button" className="reg-btn reg-btn--next" onClick={handleNext}>
                  Next: Institution Details →
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: INSTITUTION SPECIFIC DETAILS ================= */}
          {currentStep === 2 && (
            <div className="reg-card">
              <div className="reg-card__header">
                <span className="reg-card__step-tag">Step 02 of 04</span>
                <h2 className="reg-card__title">
                  {category === 'school' ? 'Inter-School Details' : 'Inter-University Details'}
                </h2>
                <p className="reg-card__subtitle">
                  {category === 'school'
                    ? 'Please provide your school, district, teacher-in-charge, and guardian verification.'
                    : 'Please provide undergraduate student enrollment and faculty verification details.'}
                </p>
              </div>

              {category === 'school' ? (
                /* SCHOOL FIELDS */
                <div className="reg-form-grid reg-form-grid--2col">
                  <div className="reg-field reg-field--full">
                    <label htmlFor="reg-school-name" className="reg-label">
                      Name of the School <span className="reg-label__required">*</span>
                    </label>
                    <input
                      id="reg-school-name"
                      type="text"
                      className="reg-input"
                      placeholder="e.g. Ananda College, Colombo"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="reg-field">
                    <label htmlFor="reg-district" className="reg-label">
                      School District (25 Districts) <span className="reg-label__required">*</span>
                    </label>
                    <select
                      id="reg-district"
                      className="reg-select"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                    >
                      {SRI_LANKA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="reg-field">
                    <label htmlFor="reg-leader-grade" className="reg-label">
                      Team Leader's Grade <span className="reg-label__required">*</span>
                    </label>
                    <select
                      id="reg-leader-grade"
                      className="reg-select"
                      value={leaderGrade}
                      onChange={(e) => setLeaderGrade(e.target.value)}
                    >
                      {SCHOOL_GRADES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="reg-field">
                    <label htmlFor="reg-teacher-name" className="reg-label">
                      Teacher in Charge: Full Name <span className="reg-label__required">*</span>
                    </label>
                    <input
                      id="reg-teacher-name"
                      type="text"
                      className="reg-input"
                      placeholder="e.g. Mrs. S. Perera"
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="reg-field">
                    <label htmlFor="reg-teacher-phone" className="reg-label">
                      Teacher in Charge: Mobile Number <span className="reg-label__required">*</span>
                    </label>
                    <input
                      id="reg-teacher-phone"
                      type="tel"
                      className="reg-input"
                      placeholder="07XXXXXXXX"
                      value={teacherPhone}
                      onChange={(e) => setTeacherPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="reg-field reg-field--full">
                    <label htmlFor="reg-guardian-details" className="reg-label">
                      Parent or Guardian of the Team Leader: Name and Mobile Number <span className="reg-label__required">*</span>
                    </label>
                    <input
                      id="reg-guardian-details"
                      type="text"
                      className="reg-input"
                      placeholder="e.g. Mr. K. Silva - 0712345678"
                      value={guardianDetails}
                      onChange={(e) => setGuardianDetails(e.target.value)}
                      required
                    />
                  </div>

                  <div className="reg-category-consent">
                    <label className="reg-category-consent__label">
                      <input
                        type="checkbox"
                        className="reg-category-consent__checkbox"
                        checked={parentConsent}
                        onChange={(e) => setParentConsent(e.target.checked)}
                      />
                      <span>
                        <strong>Parent or guardian consent:</strong> Parents or guardians of every team member under 18 should agree to their child taking part in CINERO'26.
                      </span>
                    </label>
                    <p className="reg-category-consent__notice">Please tick this box to confirm consent.</p>
                  </div>
                </div>
              ) : (
                /* UNIVERSITY FIELDS */
                <div className="reg-form-grid reg-form-grid--2col">
                  <div className="reg-field reg-field--full">
                    <label htmlFor="reg-university" className="reg-label">
                      University or Higher Education Institute <span className="reg-label__required">*</span>
                    </label>
                    <select
                      id="reg-university"
                      className="reg-select"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                    >
                      {UNIVERSITIES_LIST.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>

                  {university === 'Other' && (
                    <div className="reg-field reg-field--full">
                      <label htmlFor="reg-custom-university" className="reg-label">
                        Specify Your Institute / University Name <span className="reg-label__required">*</span>
                      </label>
                      <input
                        id="reg-custom-university"
                        type="text"
                        className="reg-input"
                        placeholder="Institute Name"
                        value={customUniversity}
                        onChange={(e) => setCustomUniversity(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="reg-field">
                    <label htmlFor="reg-faculty" className="reg-label">
                      Faculty <span className="reg-label__required">*</span>
                    </label>
                    <input
                      id="reg-faculty"
                      type="text"
                      className="reg-input"
                      placeholder="e.g. Faculty of Humanities & Social Sciences"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      required
                    />
                  </div>

                  <div className="reg-field">
                    <label htmlFor="reg-degree" className="reg-label">
                      Degree Programme <span className="reg-label__required">*</span>
                    </label>
                    <input
                      id="reg-degree"
                      type="text"
                      className="reg-input"
                      placeholder="e.g. BA (Hons) in Mass Communication"
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      required
                    />
                  </div>

                  <div className="reg-field">
                    <label htmlFor="reg-year-of-study" className="reg-label">
                      Team Leader's Year of Study <span className="reg-label__required">*</span>
                    </label>
                    <select
                      id="reg-year-of-study"
                      className="reg-select"
                      value={yearOfStudy}
                      onChange={(e) => setYearOfStudy(e.target.value)}
                    >
                      {UNIVERSITY_YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="reg-field">
                    <label htmlFor="reg-student-reg-no" className="reg-label">
                      Team Leader's Student Registration Number <span className="reg-label__required">*</span>
                    </label>
                    <input
                      id="reg-student-reg-no"
                      type="text"
                      className="reg-input"
                      placeholder="e.g. AR/102938"
                      value={studentRegNo}
                      onChange={(e) => setStudentRegNo(e.target.value)}
                      required
                    />
                  </div>

                  {/* Student ID Upload */}
                  <div className="reg-field reg-field--full" style={{ marginTop: '0.5rem' }}>
                    <label htmlFor={studentIdInputId} className="reg-label">
                      Photo or scan of the Team Leader's Student ID <span className="reg-label__required">*</span>
                    </label>
                    <div className={`reg-file-dropzone ${studentIdFile ? 'has-file' : ''}`}>
                      <input
                        id={studentIdInputId}
                        type="file"
                        className="reg-file-dropzone__input"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 10 * 1024 * 1024) {
                              void Swal.fire({
                                title: 'File Too Large',
                                text: 'The selected file exceeds the 10MB limit. Please choose a smaller file.',
                                icon: 'warning',
                                background: '#171518',
                                color: '#fff',
                                confirmButtonColor: '#d4a642',
                              });
                              e.target.value = '';
                              return;
                            }
                            setStudentIdFile(file);
                            setStudentIdFileName(file.name);
                            void Swal.fire({
                              title: 'Student ID Attached',
                              text: `"${file.name}" has been selected successfully.`,
                              icon: 'success',
                              timer: 2000,
                              showConfirmButton: false,
                              background: '#171518',
                              color: '#fff',
                            });
                          }
                        }}
                      />
                      <svg className="reg-file-dropzone__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <p className="reg-file-dropzone__text">
                        {studentIdFileName ? 'Change Student ID file' : 'Click or drag & drop to upload Student ID'}
                      </p>
                      <p className="reg-file-dropzone__subtext">Accepted formats: JPG, PNG, WEBP, or PDF (Max 10MB)</p>
                    </div>

                    {studentIdFileName && (
                      <div className="reg-file-preview">
                        <div className="reg-file-preview__info">
                          <span>📄</span>
                          <span className="reg-file-preview__name">{studentIdFileName}</span>
                        </div>
                        <button
                          type="button"
                          className="reg-file-preview__btn-remove"
                          onClick={() => {
                            setStudentIdFile(null);
                            setStudentIdFileName('');
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="reg-category-consent">
                    <label className="reg-category-consent__label">
                      <input
                        type="checkbox"
                        className="reg-category-consent__checkbox"
                        checked={universityEligibility}
                        onChange={(e) => setUniversityEligibility(e.target.checked)}
                      />
                      <span>
                        <strong>Eligibility:</strong> All team members should be currently enrolled undergraduates at a recognised university or higher education institution in Sri Lanka.
                      </span>
                    </label>
                    <p className="reg-category-consent__notice">Please tick this box to confirm your team meets the eligibility requirements.</p>
                  </div>
                </div>
              )}

              <div className="reg-actions">
                <button type="button" className="reg-btn reg-btn--prev" onClick={handlePrev}>
                  ← Back to Team Details
                </button>
                <button type="button" className="reg-btn reg-btn--next" onClick={handleNext}>
                  Next: Registration Fee & Payment →
                </button>
              </div>

            </div>
          )}

          {/* ================= STEP 3: REGISTRATION FEE AND PAYMENT ================= */}
          {currentStep === 3 && (
            <div className="reg-card">
              <div className="reg-card__header">
                <span className="reg-card__step-tag">Step 03 of 04</span>
                <h2 className="reg-card__title">Registration Fee & Payment</h2>
                <p className="reg-card__subtitle">
                  The registration fee is Rs. 2,000 per team for the Inter School Category, and Rs. 1,000 per student for the Inter University Category.
                </p>
              </div>

              {/* Fee Summary Box */}
              <div className="reg-fee-summary">
                <div className="reg-fee-summary__info">
                  <h4>Category Fee Summary</h4>
                  <p className="reg-fee-summary__calc">
                    {category === 'school'
                      ? 'Inter-School Category: Fixed team registration rate'
                      : `Inter-University Category: Rs. 1,000 × ${teamSize} registered team members`}
                  </p>
                </div>
                <div className="reg-fee-summary__amount">
                  <span className="reg-fee-summary__amount-num">Rs. {calculatedFee.toLocaleString()}</span>
                  <span className="reg-fee-summary__status">Total Payable Amount</span>
                </div>
              </div>

              {/* Official Committee Bank Account Details Card */}
              <div className="reg-bank-card">
                <div className="reg-bank-card__title">
                  <span>🏛 Official Organizing Committee Bank Account</span>
                </div>
                <div className="reg-bank-grid">
                  <div className="reg-bank-item">
                    <span className="reg-bank-item__label">Bank Name</span>
                    <span className="reg-bank-item__val">Bank of Ceylon (BOC)</span>
                  </div>
                  <div className="reg-bank-item">
                    <span className="reg-bank-item__label">Account Name</span>
                    <span className="reg-bank-item__val">J'PURA VOICE FILMING DIVISION</span>
                  </div>
                  <div className="reg-bank-item">
                    <span className="reg-bank-item__label">Account Number</span>
                    <span className="reg-bank-item__val">000000000</span>
                  </div>
                  <div className="reg-bank-item">
                    <span className="reg-bank-item__label">Branch</span>
                    <span className="reg-bank-item__val">Gangodawila Branch</span>
                  </div>
                </div>
              </div>

              <div className="reg-form-grid reg-form-grid--2col">
                <div className="reg-field">
                  <label htmlFor="reg-amount-paid" className="reg-label">
                    Amount Paid (Rs.) <span className="reg-label__required">*</span>
                  </label>
                  <input
                    id="reg-amount-paid"
                    type="number"
                    className="reg-input"
                    value={calculatedFee}
                    readOnly
                  />
                  <span className="reg-hint">Calculated automatically based on category and team size.</span>
                </div>

                <div className="reg-field">
                  <label htmlFor="reg-payment-method" className="reg-label">
                    Payment Method <span className="reg-label__required">*</span>
                  </label>
                  <select
                    id="reg-payment-method"
                    className="reg-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as 'Bank deposit' | 'Online transfer' | 'Other')}
                  >
                    <option value="Online transfer">Online Bank Transfer / Mobile Banking</option>
                    <option value="Bank deposit">Bank Branch Cash Deposit</option>
                    <option value="Other">CDM (Cash Deposit Machine) / Other</option>
                  </select>
                </div>

                <div className="reg-field">
                  <label htmlFor="reg-payment-date" className="reg-label">
                    Date of Payment <span className="reg-label__required">*</span>
                  </label>
                  <input
                    id="reg-payment-date"
                    type="date"
                    className="reg-input"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    required
                  />
                </div>

                <div className="reg-field">
                  <label htmlFor="reg-payment-ref" className="reg-label">
                    Payment Reference or Slip Number (Optional)
                  </label>
                  <input
                    id="reg-payment-ref"
                    type="text"
                    className="reg-input"
                    placeholder="e.g. TXN987654321"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                  />
                </div>

                {/* Upload Payment Slip */}
                <div className="reg-field reg-field--full" style={{ marginTop: '0.5rem' }}>
                  <label htmlFor={paymentSlipInputId} className="reg-label">
                    Upload the Payment Slip / Receipt <span className="reg-label__required">*</span>
                  </label>
                  <div className={`reg-file-dropzone ${paymentSlipFile ? 'has-file' : ''}`}>
                    <input
                      id={paymentSlipInputId}
                      type="file"
                      className="reg-file-dropzone__input"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 10 * 1024 * 1024) {
                            void Swal.fire({
                              title: 'File Too Large',
                              text: 'The selected receipt file exceeds 10MB. Please upload a smaller file.',
                              icon: 'warning',
                              background: '#171518',
                              color: '#fff',
                              confirmButtonColor: '#d4a642',
                            });
                            e.target.value = '';
                            return;
                          }
                          setPaymentSlipFile(file);
                          setPaymentSlipFileName(file.name);
                          void Swal.fire({
                            title: 'Payment Slip Attached',
                            text: `"${file.name}" has been selected successfully.`,
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false,
                            background: '#171518',
                            color: '#fff',
                          });
                        }
                      }}
                    />
                    <svg className="reg-file-dropzone__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                    <p className="reg-file-dropzone__text">
                      {paymentSlipFileName ? 'Change Payment Slip' : 'Click or drag & drop to upload payment receipt'}
                    </p>
                    <p className="reg-file-dropzone__subtext">Accepted formats: JPG, PNG, WEBP, or PDF (Max 10MB)</p>
                  </div>

                  {paymentSlipFileName && (
                    <div className="reg-file-preview">
                      <div className="reg-file-preview__info">
                        <span>🧾</span>
                        <span className="reg-file-preview__name">{paymentSlipFileName}</span>
                      </div>
                      <button
                        type="button"
                        className="reg-file-preview__btn-remove"
                        onClick={() => {
                          setPaymentSlipFile(null);
                          setPaymentSlipFileName('');
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <span className="reg-hint">Registration is complete only after the organising committee confirms the payment.</span>
                </div>
              </div>

              <div className="reg-actions">
                <button type="button" className="reg-btn reg-btn--prev" onClick={handlePrev}>
                  ← Back to Institution Details
                </button>
                <button type="button" className="reg-btn reg-btn--next" onClick={handleNext}>
                  Next: Declarations & Feedback →
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 4: DECLARATIONS AND FEEDBACK ================= */}
          {currentStep === 4 && (
            <div className="reg-card">
              <div className="reg-card__header">
                <span className="reg-card__step-tag">Step 04 of 04</span>
                <h2 className="reg-card__title">Declarations & Confirmation</h2>
                <p className="reg-card__subtitle">
                  Please review the official festival declarations before completing your team registration.
                </p>
              </div>

              <div className="reg-declarations">
                <label className="reg-declaration-note">
                  <input
                    type="checkbox"
                    className="reg-declaration-checkbox"
                    checked={acceptRules}
                    onChange={(e) => setAcceptRules(e.target.checked)}
                  />
                  <span><strong>Rules and regulations:</strong> Teams are expected to follow the CINERO'26 rules and regulations.</span>
                </label>
                <label className="reg-declaration-note">
                  <input
                    type="checkbox"
                    className="reg-declaration-checkbox"
                    checked={productionDateAccuracy}
                    onChange={(e) => setProductionDateAccuracy(e.target.checked)}
                  />
                  <span><strong>Production date and accuracy:</strong> Films must be produced or completed on or after January 1, 2026. Submissions may be disqualified if any provided information is false or misleading.</span>
                </label>
                <label className="reg-declaration-note">
                  <input
                    type="checkbox"
                    className="reg-declaration-checkbox"
                    checked={copyrightCleared}
                    onChange={(e) => setCopyrightCleared(e.target.checked)}
                  />
                  <span><strong>Copyright:</strong> All music, footage, photographs, graphics, fonts, stock footage, and other third-party materials used in the film must be legally obtained or appropriately licensed.</span>
                </label>
                <label className="reg-declaration-note">
                  <input
                    type="checkbox"
                    className="reg-declaration-checkbox"
                    checked={useOfInfo}
                    onChange={(e) => setUseOfInfo(e.target.checked)}
                  />
                  <span><strong>Use of information:</strong> The CINERO'26 organising committee may use the details in this form to contact the team and run the festival.</span>
                </label>
              </div>

              <div className="reg-form-grid" style={{ marginBottom: '1.75rem' }}>
                <div className="reg-field">
                  <label htmlFor="reg-signature" className="reg-label">
                    Team Leader's Confirmation (Team Leader's Full Name) <span className="reg-label__required">*</span>
                  </label>
                  <input
                    id="reg-signature"
                    type="text"
                    className="reg-input"
                    placeholder="Type your full name to confirm that the information in this form is true and accurate"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    required
                  />
                </div>

                <div className="reg-field">
                  <label htmlFor="reg-questions" className="reg-label">
                    Do you have any questions for the CINERO'26 organising committee? (Optional)
                  </label>
                  <textarea
                    id="reg-questions"
                    className="reg-textarea"
                    placeholder="Write any questions, special requirements, or inquiries here..."
                    value={questions}
                    onChange={(e) => setQuestions(e.target.value)}
                  />
                </div>

                <div className="reg-field">
                  <span className="reg-label">How did you hear about CINERO'26? (Optional)</span>
                  <div className="reg-source-options">
                    {HEAR_SOURCES.map((src) => {
                      const isSelected = selectedSources.includes(src);
                      return (
                        <button
                          key={src}
                          type="button"
                          className={`reg-source-btn ${isSelected ? 'is-active' : ''}`}
                          aria-pressed={isSelected}
                          onClick={() => handleSourceToggle(src)}
                        >
                          {src}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="reg-actions">
                <button type="button" className="reg-btn reg-btn--prev" onClick={handlePrev} disabled={isSubmitting}>
                  ← Back to Payment
                </button>
                <button type="submit" className="reg-btn reg-btn--submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Registering Team...' : 'Complete Team Registration ★'}
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 5: CONFIRMATION MESSAGE & SUMMARY ================= */}
          {currentStep === 5 && (
            <div className="reg-card reg-card--confirmation">
              {/* Screen-Only Prominent Animated Red Action Notice */}
              <div className="reg-success__urgent-alert" role="alert">
                <div className="reg-success__urgent-glow"></div>
                <div className="reg-success__urgent-icon">
                  <span className="reg-success__pulse-ring"></span>
                  ⚠️
                </div>
                <div className="reg-success__urgent-content">
                  <div className="reg-success__urgent-badge">CRITICAL FINAL STEP</div>
                  <h3 className="reg-success__urgent-title">
                    Print or save this summary as a PDF, then email it to:
                  </h3>
                  <a href="mailto:cinero2026@gmail.com" className="reg-success__urgent-email">
                    cinero2026@gmail.com
                  </a>
                  <p className="reg-success__urgent-sub">
                    Your team registration is only finalized after sending this confirmation PDF along with any supporting documents to our committee email.
                  </p>
                </div>
              </div>

              {/* Printable Premium Confirmation Document */}
              <div className="reg-doc" id="cinero-print-document">
                {/* Print/Doc Header */}
                <header className="reg-doc__header">
                  <div className="reg-doc__brand">
                    <img
                      src="/images/cinero-logo-with-caption-optimized.png"
                      alt="CINERO'26 Logo"
                      className="reg-doc__logo"
                    />
                    <div className="reg-doc__brand-text">
                      <span className="reg-doc__fest-title">CINERO '26</span>
                      <span className="reg-doc__fest-sub">All-Island Short Film Festival</span>
                      <span className="reg-doc__fest-tagline">“A Stage for Every Story”</span>
                    </div>
                  </div>
                  <div className="reg-doc__organizer">
                    <span className="reg-doc__org-line">Organized by J'pura Voice Filming Division</span>
                    <span className="reg-doc__org-line">University of Sri Jayewardenepura</span>
                    <span className="reg-doc__date-badge">Issued: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                </header>

                <div className="reg-doc__divider"></div>

                {/* Status & Reference ID Banner */}
                <div className="reg-doc__status-block">
                  <div className="reg-doc__status-left">
                    <span className="reg-doc__status-pill">✓ OFFICIAL CONFIRMATION</span>
                    <h2 className="reg-doc__status-heading">REGISTRATION SUCCESSFUL</h2>
                    <p className="reg-doc__status-note">
                      Thank you for submitting your entry for <strong>CINERO'26</strong>. Please retain this document for all future inquiries.
                    </p>
                  </div>
                  <div className="reg-doc__ref-box">
                    <span className="reg-doc__ref-label">REGISTRATION REFERENCE ID</span>
                    <span className="reg-doc__ref-code">{referenceId || 'CNR26-CONFIRMED'}</span>
                    <span className="reg-doc__ref-hint">Keep safe for submission portal</span>
                  </div>
                </div>

                {/* Registration Details Section */}
                <section className="reg-doc__section">
                  <div className="reg-doc__section-header">
                    <span className="reg-doc__section-title">TEAM & REGISTRATION SPECIFICATIONS</span>
                  </div>
                  <div className="reg-doc__grid">
                    <div className="reg-doc__field">
                      <span className="reg-doc__label">Team Name</span>
                      <span className="reg-doc__val reg-doc__val--highlight">{teamName}</span>
                    </div>
                    <div className="reg-doc__field">
                      <span className="reg-doc__label">Festival Category</span>
                      <span className="reg-doc__val">
                        {category === 'school' ? 'Inter-School Category' : 'Inter-University Category'}
                      </span>
                    </div>
                    <div className="reg-doc__field">
                      <span className="reg-doc__label">Team Leader</span>
                      <span className="reg-doc__val">{leaderName}</span>
                    </div>
                    <div className="reg-doc__field">
                      <span className="reg-doc__label">Leader Contact Number</span>
                      <span className="reg-doc__val">{leaderPhone}</span>
                    </div>
                    <div className="reg-doc__field">
                      <span className="reg-doc__label">Leader Email</span>
                      <span className="reg-doc__val">{leaderEmail}</span>
                    </div>
                    <div className="reg-doc__field">
                      <span className="reg-doc__label">Institution / Faculty</span>
                      <span className="reg-doc__val">
                        {category === 'school' ? schoolName : (university === 'Other' ? customUniversity : university)}
                        {category === 'school' && district ? ` (${district} District)` : ''}
                        {category === 'university' && faculty ? ` - ${faculty}` : ''}
                      </span>
                    </div>
                    <div className="reg-doc__field">
                      <span className="reg-doc__label">Total Registered Members</span>
                      <span className="reg-doc__val">{teamSize} Members</span>
                    </div>
                    <div className="reg-doc__field">
                      <span className="reg-doc__label">Payment Status & Method</span>
                      <span className="reg-doc__val">Paid via {paymentMethod} (Slip Attached)</span>
                    </div>
                    <div className="reg-doc__field reg-doc__field--full reg-doc__field--fee">
                      <span className="reg-doc__label">Official Registration Fee Paid</span>
                      <span className="reg-doc__fee-num">Rs. {calculatedFee.toLocaleString()}.00 LKR</span>
                    </div>
                  </div>
                </section>

                {/* Next Steps & Submission Window */}
                <section className="reg-doc__next-steps">
                  <div className="reg-doc__section-header">
                    <span className="reg-doc__section-title">VERIFICATION & FILM SUBMISSION TIMELINE</span>
                  </div>
                  <div className="reg-doc__steps-grid">
                    <div className="reg-doc__step-card">
                      <div className="reg-doc__step-badge">STAGE 01</div>
                      <h4 className="reg-doc__step-title">Verification & Review</h4>
                      <p className="reg-doc__step-desc">
                        The organizing committee is reviewing your submitted details, student identification, and bank slip.
                      </p>
                    </div>
                    <div className="reg-doc__step-card">
                      <div className="reg-doc__step-badge">STAGE 02</div>
                      <h4 className="reg-doc__step-title">Film Submission Window</h4>
                      <p className="reg-doc__step-desc">
                        The portal opens exclusively for confirmed teams from:
                        <strong className="reg-doc__date-highlight"> November 9 – December 6, 2026</strong>.
                      </p>
                    </div>
                    <div className="reg-doc__step-card">
                      <div className="reg-doc__step-badge">STAGE 03</div>
                      <h4 className="reg-doc__step-title">Portal Access Link</h4>
                      <p className="reg-doc__step-desc">
                        Upon successful verification, your team leader will receive private submission access to upload your short film.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Instructions & Inquiries Notice */}
                <div className="reg-doc__inquiry-bar">
                  <div className="reg-doc__inquiry-item">
                    <span className="reg-doc__inquiry-label">Required Action:</span>
                    <span className="reg-doc__inquiry-val">Email this PDF file to <strong>cinero2026@gmail.com</strong> with your Reference ID in the subject.</span>
                  </div>
                  <div className="reg-doc__inquiry-item">
                    <span className="reg-doc__inquiry-label">Inquiries & Support:</span>
                    <span className="reg-doc__inquiry-val"><strong>cinero2026@gmail.com</strong> | J'pura Voice Filming Division</span>
                  </div>
                </div>

                {/* Footer Signature & Verification Bar */}
                <footer className="reg-doc__footer">
                  <div className="reg-doc__footer-left">
                    <span className="reg-doc__footer-brand">CINERO'26 | A Stage for Every Story</span>
                    <span className="reg-doc__footer-desc">J'pura Voice Filming Division • University of Sri Jayewardenepura</span>
                  </div>
                  <div className="reg-doc__footer-right">
                    <div className="reg-doc__seal">
                      <span>OFFICIALLY REGISTERED</span>
                      <small>VERIFIED RECORD</small>
                    </div>
                  </div>
                </footer>
              </div>

              {/* Action Buttons (Hidden during Print) */}
              <div className="reg-success__actions">
                <button
                  type="button"
                  className="reg-btn reg-btn--next reg-btn--print-main"
                  onClick={() => window.print()}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                    <rect x="6" y="14" width="12" height="8"></rect>
                  </svg>
                  Print / Save Official PDF
                </button>
                <button
                  type="button"
                  className="reg-btn reg-btn--prev"
                  onClick={onBack}
                >
                  Return to Festival Home
                </button>
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  );
};

export default RegistrationPage;
