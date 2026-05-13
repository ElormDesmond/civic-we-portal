import React, { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useNavigate } from 'react-router-dom';

// Submit Action function
async function submitBuildingPermit(_prevState: any, formData: FormData) {
  // Simulate a delay
  await new Promise((res) => setTimeout(res, 1500));

  const payload = {
    project_title: formData.get('project_title'),
    project_type: formData.get('project_type'),
    estimated_cost: formData.get('estimated_cost'),
    site_address: formData.get('site_address'),
    plot_number: formData.get('plot_number'),
    contact_phone: formData.get('contact_phone'),
  };

  try {
    const response = await fetch('http://localhost:8888/api/permits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        permit_type: 'Building Permit',
        payload: payload,
      }),
      credentials: 'include',
    });

    if (response.ok) {
      return { success: true, message: 'Application submitted successfully!' };
    } else {
      const errorData = await response.json();
      return { success: false, message: errorData.error || 'Submission failed' };
    }
  } catch (err) {
    return { success: false, message: 'Network error occurred.' };
  }
}

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full py-3 px-6 rounded-xl font-bold text-white transition shadow-lg ${
        pending ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
      }`}
    >
      {pending ? 'Submitting Application...' : 'Submit Application'}
    </button>
  );
};

const BuildingPermit: React.FC = () => {
  const [step, setStep] = useState(1);
  const [state, formAction] = useActionState(submitBuildingPermit, null);
  const navigate = useNavigate();

  if (state?.success) {
    setTimeout(() => navigate('/dashboard'), 2000);
    return (
      <div className="max-w-2xl mx-auto mt-20 p-8 bg-green-50 border border-green-200 rounded-2xl text-center">
        <span className="text-5xl mb-4 block">✅</span>
        <h2 className="text-2xl font-bold text-green-800 mb-2">Success!</h2>
        <p className="text-green-700">{state.message}</p>
        <p className="mt-4 text-sm text-green-600">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Building Permit Application</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Please complete all steps to submit your request.</p>

      {/* Stepper */}
      <div className="flex items-center mb-10 space-x-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${
              step >= s ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-400'
            }`}>
              {s}
            </div>
            {s < 3 && <div className={`w-12 h-0.5 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <form action={formAction} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        {state?.success === false && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {state.message}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4">Step 1: Project Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project Title</label>
              <input name="project_title" required type="text" className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="e.g., Residential Renovation" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project Type</label>
                <select name="project_type" className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl outline-none">
                  <option>Residential</option>
                  <option>Commercial</option>
                  <option>Industrial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Cost (GHS)</label>
                <input name="estimated_cost" required type="number" className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl outline-none" />
              </div>
            </div>
            <button type="button" onClick={() => setStep(2)} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition">
              Next Step
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4">Step 2: Location Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Site Address</label>
              <textarea name="site_address" required rows={3} className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl outline-none" placeholder="House No, Street Name, Suburb"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Plot Number (if available)</label>
              <input name="plot_number" type="text" className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl outline-none" />
            </div>
            <div className="flex space-x-4">
              <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition">
                Back
              </button>
              <button type="button" onClick={() => setStep(3)} className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition">
                Next Step
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4">Step 3: Review & Submit</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Phone Number</label>
              <input name="contact_phone" required type="tel" className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl outline-none" placeholder="+233..." />
            </div>
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
              By submitting this application, you declare that all provided information is accurate to the best of your knowledge.
            </div>
            <div className="flex space-x-4">
              <button type="button" onClick={() => setStep(2)} className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition">
                Back
              </button>
              <div className="flex-1">
                <SubmitButton />
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default BuildingPermit;
