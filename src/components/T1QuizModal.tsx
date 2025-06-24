import React, { useState } from 'react';

interface QuizQuestion {
  id: string;
  question: string;
  options: { value: string; label: string; triggers?: string[] }[];
  category: 'income' | 'deductions' | 'credits' | 'personal';
}

interface T1QuizModalProps {
  show: boolean;
  onClose: () => void;
  onComplete: (selectedSchedules: string[], prefilledData: any) => void;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 'employment',
    question: 'Do you have employment income (T4 slips)?',
    category: 'income',
    options: [
      { value: 'yes', label: 'Yes, I received T4 slip(s)', triggers: ['basic'] },
      { value: 'no', label: 'No employment income' }
    ]
  },
  {
    id: 'selfEmployed',
    question: 'Are you self-employed or have business income?',
    category: 'income',
    options: [
      { value: 'yes', label: 'Yes, I have business income', triggers: ['T2125'] },
      { value: 'professional', label: 'Yes, I have professional income', triggers: ['T2032'] },
      { value: 'no', label: 'No business income' }
    ]
  },
  {
    id: 'rental',
    question: 'Do you have rental income from real estate?',
    category: 'income',
    options: [
      { value: 'yes', label: 'Yes, I own rental property', triggers: ['T776'] },
      { value: 'no', label: 'No rental income' }
    ]
  },
  {
    id: 'investments',
    question: 'Do you have investment income?',
    category: 'income',
    options: [
      { value: 'dividends', label: 'Yes, Canadian dividends', triggers: ['Schedule4'] },
      { value: 'interest', label: 'Yes, interest income', triggers: ['basic'] },
      { value: 'capital', label: 'Yes, capital gains/losses', triggers: ['Schedule3'] },
      { value: 'foreign', label: 'Yes, foreign investment income', triggers: ['T1135'] },
      { value: 'no', label: 'No investment income' }
    ]
  },
  {
    id: 'rrsp',
    question: 'Did you contribute to an RRSP in 2024?',
    category: 'deductions',
    options: [
      { value: 'yes', label: 'Yes, I made RRSP contributions', triggers: ['Schedule7'] },
      { value: 'spousal', label: 'Yes, spousal RRSP contributions', triggers: ['Schedule7'] },
      { value: 'no', label: 'No RRSP contributions' }
    ]
  },
  {
    id: 'childcare',
    question: 'Did you pay for child care expenses?',
    category: 'deductions',
    options: [
      { value: 'yes', label: 'Yes, I paid child care expenses', triggers: ['T778'] },
      { value: 'no', label: 'No child care expenses' }
    ]
  },
  {
    id: 'medical',
    question: 'Do you have medical expenses to claim?',
    category: 'credits',
    options: [
      { value: 'yes', label: 'Yes, I have medical expenses', triggers: ['Schedule1'] },
      { value: 'no', label: 'No medical expenses' }
    ]
  },
  {
    id: 'donations',
    question: 'Did you make charitable donations?',
    category: 'credits',
    options: [
      { value: 'yes', label: 'Yes, I made charitable donations', triggers: ['Schedule9'] },
      { value: 'no', label: 'No charitable donations' }
    ]
  },
  {
    id: 'spouse',
    question: 'What is your marital status?',
    category: 'personal',
    options: [
      { value: 'married', label: 'Married', triggers: ['spousal'] },
      { value: 'common_law', label: 'Common-law partner', triggers: ['spousal'] },
      { value: 'single', label: 'Single' },
      { value: 'divorced', label: 'Divorced' },
      { value: 'separated', label: 'Separated' },
      { value: 'widowed', label: 'Widowed' }
    ]
  },
  {
    id: 'province',
    question: 'Which province/territory do you live in?',
    category: 'personal',
    options: [
      { value: 'QC', label: '🇫🇷 Quebec (separate TP-1 required)', triggers: ['TP1'] },
      { value: 'ON', label: '🍁 Ontario' },
      { value: 'BC', label: '🏔️ British Columbia' },
      { value: 'AB', label: '🛢️ Alberta' },
      { value: 'SK', label: '🌾 Saskatchewan' },
      { value: 'MB', label: '🦬 Manitoba' },
      { value: 'NB', label: '🦞 New Brunswick' },
      { value: 'NS', label: '⚓ Nova Scotia' },
      { value: 'PE', label: '🥔 Prince Edward Island' },
      { value: 'NL', label: '🐧 Newfoundland and Labrador' },
      { value: 'NT', label: '❄️ Northwest Territories' },
      { value: 'NU', label: '🐻‍❄️ Nunavut' },
      { value: 'YT', label: '🏔️ Yukon' }
    ]
  }
];

const scheduleDescriptions: Record<string, string> = {
  'basic': 'T1 General - Basic tax return',
  'T2125': 'Statement of Business or Professional Activities',
  'T2032': 'Statement of Professional Activities',
  'T776': 'Statement of Real Estate Rentals',
  'Schedule3': 'Capital Gains (or Losses)',
  'Schedule4': 'Statement of Investment Income',
  'Schedule7': 'RRSP and PRPP Contributions',
  'Schedule9': 'Donations and Gifts',
  'Schedule1': 'Federal Tax',
  'T778': 'Child Care Expenses Deduction',
  'T1135': 'Foreign Income Verification Statement',
  'TP1': 'Quebec Income Tax Return (separate)',
  'spousal': 'Spousal information required'
};

export default function T1QuizModal({ show, onClose, onComplete }: T1QuizModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedSchedules, setSelectedSchedules] = useState<Set<string>>(new Set());

  const handleAnswer = (questionId: string, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    // Add triggered schedules
    const question = quizQuestions[currentQuestion];
    const selectedOption = question.options.find(opt => opt.value === answer);
    if (selectedOption?.triggers) {
      const newSchedules = new Set(selectedSchedules);
      selectedOption.triggers.forEach(trigger => newSchedules.add(trigger));
      setSelectedSchedules(newSchedules);
    }

    // Move to next question
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeQuiz(newAnswers);
    }
  };

  const completeQuiz = (finalAnswers: Record<string, string>) => {
    // Generate prefilled data based on answers
    const prefilledData = generatePrefilledData(finalAnswers);
    
    // Add basic schedule if none selected
    if (selectedSchedules.size === 0) {
      selectedSchedules.add('basic');
    }

    onComplete(Array.from(selectedSchedules), prefilledData);
    onClose();
  };

  const generatePrefilledData = (answers: Record<string, string>) => {
    const data: any = {
      province: answers.province || 'QC',
      maritalStatus: answers.spouse || 'single',
      age: 35, // Default age
    };

    // Add realistic sample data based on answers
    if (answers.employment === 'yes') {
      data.salary = 75000; // Sample employment income
      data.employmentInsurancePremiums = 1049.40;
      data.cppContributions = 3754.45;
    }

    if (answers.selfEmployed === 'yes') {
      data.businessIncome = 45000;
    }

    if (answers.rental === 'yes') {
      data.rentalIncome = 18000;
    }

    if (answers.investments === 'dividends') {
      data.eligibleDiv = 2500;
    }

    if (answers.investments === 'capital') {
      data.capitalGains = 8000;
    }

    if (answers.rrsp === 'yes') {
      data.rrspContribution = 13500;
    }

    if (answers.medical === 'yes') {
      data.medicalExpenses = 3200;
    }

    if (answers.donations === 'yes') {
      data.charitableDonations = 1500;
    }

    return data;
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (!show) return null;

  const question = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-cookie-yellow border-0">
            <div className="d-flex align-items-center">
              <i className="bi bi-clipboard-check-fill me-2 text-cookie-brown fs-4"></i>
              <div>
                <h5 className="modal-title text-cookie-brown mb-0">T1 General Setup Quiz</h5>
                <small className="text-cookie-brown opacity-75">
                  Question {currentQuestion + 1} of {quizQuestions.length}
                </small>
              </div>
            </div>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="progress" style={{ height: '8px' }}>
                <div 
                  className="progress-bar bg-cookie-orange" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  {question.category.charAt(0).toUpperCase() + question.category.slice(1)}
                </small>
                <small className="text-muted">{Math.round(progress)}% complete</small>
              </div>
            </div>

            {/* Question */}
            <div className="mb-4">
              <h6 className="text-cookie-brown mb-3">
                <i className="bi bi-question-circle me-2 text-cookie-orange"></i>
                {question.question}
              </h6>

              <div className="row g-2">
                {question.options.map((option, index) => (
                  <div key={option.value} className="col-12">
                    <button
                      className="btn btn-outline-cookie w-100 text-start p-3"
                      onClick={() => handleAnswer(question.id, option.value)}
                    >
                      <div className="d-flex align-items-center">
                        <span className="badge bg-cookie-orange text-white me-3 rounded-circle">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span>{option.label}</span>
                        {option.triggers && (
                          <span className="ms-auto">
                            <i className="bi bi-plus-circle text-cookie-orange"></i>
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Schedules Preview */}
            {selectedSchedules.size > 0 && (
              <div className="alert alert-cookie-info">
                <h6 className="alert-heading">
                  <i className="bi bi-file-earmark-text me-2"></i>
                  Forms & Schedules Required:
                </h6>
                <div className="row g-2">
                  {Array.from(selectedSchedules).map(schedule => (
                    <div key={schedule} className="col-md-6">
                      <span className="badge bg-cookie-yellow text-cookie-brown me-2">
                        {schedule}
                      </span>
                      <small>{scheduleDescriptions[schedule]}</small>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer border-0 bg-light">
            <div className="d-flex justify-content-between w-100">
              <button 
                className="btn btn-outline-secondary"
                onClick={goBack}
                disabled={currentQuestion === 0}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back
              </button>
              
              <button 
                className="btn btn-cookie-outline"
                onClick={onClose}
              >
                Skip Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 