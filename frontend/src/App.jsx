import { useState } from 'react';
import axios from 'axios';
import { Leaf, DollarSign,IndianRupee, Package, PieChart, Activity, MapPin, Building, Target } from 'lucide-react';

function App() {
  const [formData, setFormData] = useState({
    business_type: '',
    budget: '',
    priority: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState(null);
  const [error, setError] = useState('');

  const priorities = [
    'General sustainability',
    'Eco-friendly packaging',
    'Energy efficiency',
    'Waste reduction',
    'Sustainable dining supplies',
    'Green office supplies'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setProposal(null);
    
    if (!formData.business_type || !formData.budget) {
      setError('Business type and budget are required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        budget: Number(formData.budget)
      };
      
      const response = await axios.post('http://localhost:8000/api/generate-proposal', payload);
      setProposal(response.data.ai_output);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'An error occurred generating the proposal.');
    } finally {
      setLoading(false);
    }
  };

  const renderProducts = () => {
    if (!proposal?.products) return null;
    return proposal.products.map((product, idx) => (
      <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-xl mb-3">
        <div className="flex justify-between items-center mb-2">
          <div className="font-semibold text-lg">{product.name}</div>
          <div className="text-emerald-400 font-bold">₹{product.total_cost?.toLocaleString()}</div>
        </div>
        <div className="text-slate-400 text-sm mb-3 leading-relaxed">{product.description}</div>
        <div className="flex justify-between text-xs text-slate-400 bg-black/20 px-3 py-2 rounded-lg">
          <span>Qty: {product.quantity}</span>
          <span>@ ₹{product.unit_price}/piece</span>
        </div>
      </div>
    ));
  };

  const renderBudgetAllocation = () => {
    if (!proposal?.budget_allocation) return null;
    return Object.entries(proposal.budget_allocation).map(([category, amount], idx) => (
      <div key={idx} className="flex justify-between py-3 border-b border-white/10 last:border-0">
        <span className="capitalize text-slate-200">{category.replace(/_/g, ' ')}</span>
        <span className="font-mono text-lg">₹{Number(amount).toLocaleString()}</span>
      </div>
    ));
  };

  return (
    <div className="w-full max-w-5xl flex flex-col gap-8">
      <header className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-extrabold pb-1 bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent inline-block">
          EcoSmart B2B Proposals
        </h1>
        <p className="text-slate-400 text-lg">AI-powered sustainable product curation for your business</p>
      </header>

      <main className="flex flex-col gap-8">
        <div className="glass-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-medium text-slate-200 text-sm">
                <Building size={16} /> Business Type *
              </label>
              <input 
                type="text" 
                name="business_type"
                className="form-input"
                placeholder="e.g., Downtown Cafe, Boutique Hotel" 
                value={formData.business_type}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-medium text-slate-200 text-sm">
                <IndianRupee size={16} /> Total Budget (INR) *
              </label>
              <input 
                type="number" 
                name="budget"
                className="form-input"
                placeholder="e.g., 5000" 
                min="1"
                value={formData.budget}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 font-medium text-slate-200 text-sm">
                <Target size={16} /> Priority Focus
              </label>
              <select name="priority" value={formData.priority} onChange={handleChange} className="form-input appearance-none">
                <option value="">Select a priority...</option>
                {priorities.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 font-medium text-slate-200 text-sm">
                <MapPin size={16} /> Location (Optional)
              </label>
              <input 
                type="text" 
                name="location"
                className="form-input"
                placeholder="e.g., New York, NY" 
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            {error && <div className="text-red-400 bg-red-900/20 px-4 py-3 rounded-lg border border-red-500/20">{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <><div className="spinner"></div> Generating Proposal...</>
              ) : (
                <><Leaf size={20} /> Generate Sustainable Proposal</>
              )}
            </button>
          </form>
        </div>

        {proposal && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="glass-card flex flex-col">
              <h3 className="text-xl text-indigo-400 mb-4 flex items-center gap-2 font-semibold">
                <PieChart size={24} /> Budget Allocation
              </h3>
              
              <div className="w-full h-2.5 bg-white/10 rounded-full my-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000 ease-out" 
                  style={{ width: `${Math.min((proposal.cost_breakdown?.total_estimated_cost / Number(formData.budget)) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-slate-400 mb-6">
                <span>Used: ₹{proposal.cost_breakdown?.total_estimated_cost?.toLocaleString()}</span>
                <span>Limit: ₹{Number(formData.budget).toLocaleString()}</span>
              </div>
              
              <div className="flex-1">
                {renderBudgetAllocation()}
              </div>
            </div>

            <div className="glass-card">
              <h3 className="text-xl text-indigo-400 mb-4 flex items-center gap-2 font-semibold">
                <Package size={24} /> Recommended Products
              </h3>
              <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {renderProducts()}
              </div>
            </div>

            <div className="glass-card md:col-span-2">
              <h3 className="text-xl text-indigo-400 mb-4 flex items-center gap-2 font-semibold">
                <Activity size={24} /> Sustainability Impact
              </h3>
              <div className="leading-relaxed text-slate-200 bg-emerald-500/10 p-5 rounded-xl border-l-4 border-emerald-500">
                {proposal.impact_summary}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
