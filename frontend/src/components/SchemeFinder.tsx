import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Filter, CheckCircle2, ChevronRight, ExternalLink, Leaf, Shield, CreditCard, Droplets, Tractor, Sprout, Users, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';

interface SchemeFinderProps {
  onBack: () => void;
  language: Language;
}

type FarmerType = 'All' | 'Small' | 'Marginal' | 'Large';
type Category = 'All' | 'Crop Insurance' | 'Subsidies' | 'Credit/Loans' | 'Equipment' | 'Irrigation' | 'Organic Farming' | 'Women Farmers';

interface Scheme {
  id: string;
  name: string;
  badge: string;
  benefit: string;
  eligibility: string[];
  howToApply: string[];
  deadline: string;
  link: string;
  categories: Category[];
  farmerTypes: FarmerType[];
  states: string[];
  maxLandSize: number;
  icon: React.ReactNode;
}

const SCHEMES: Scheme[] = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN',
    badge: 'Central Govt',
    benefit: '₹6,000/year direct income support',
    eligibility: ['Small and marginal farmers', 'Cultivable landholding', 'Valid Aadhaar and bank account'],
    howToApply: ['Visit PM-KISAN portal', 'Click on New Farmer Registration', 'Enter Aadhaar and details', 'Submit for verification'],
    deadline: 'Ongoing',
    link: 'https://pmkisan.gov.in/',
    categories: ['Subsidies'],
    farmerTypes: ['Small', 'Marginal'],
    states: ['All'],
    maxLandSize: 5,
    icon: <Leaf className="text-primary-dark" size={24} />
  },
  {
    id: 'pmfby',
    name: 'PMFBY (Pradhan Mantri Fasal Bima Yojana)',
    badge: 'Central Govt',
    benefit: 'Comprehensive crop insurance',
    eligibility: ['All farmers growing notified crops', 'Sharecroppers and tenant farmers included'],
    howToApply: ['Contact local bank branch', 'Or apply via PMFBY portal/app', 'Pay premium before cutoff date'],
    deadline: 'Varies by season (Kharif/Rabi)',
    link: 'https://pmfby.gov.in/',
    categories: ['Crop Insurance'],
    farmerTypes: ['Small', 'Marginal', 'Large'],
    states: ['All'],
    maxLandSize: 999,
    icon: <Shield className="text-primary-dark" size={24} />
  },
  {
    id: 'kcc',
    name: 'Kisan Credit Card (KCC)',
    badge: 'Central Govt',
    benefit: 'Subsidized credit up to ₹3 lakh at 4% interest',
    eligibility: ['All farmers, tenant farmers, sharecroppers', 'Animal husbandry and fishery farmers'],
    howToApply: ['Visit nearest bank branch', 'Submit KCC application form', 'Provide land documents and Aadhaar'],
    deadline: 'Ongoing',
    link: 'https://sbi.co.in/web/agri-rural/agriculture-banking/crop-loan/kisan-credit-card',
    categories: ['Credit/Loans'],
    farmerTypes: ['Small', 'Marginal', 'Large'],
    states: ['All'],
    maxLandSize: 999,
    icon: <CreditCard className="text-primary-dark" size={24} />
  },
  {
    id: 'pmksy',
    name: 'PM Krishi Sinchai Yojana',
    badge: 'Central Govt',
    benefit: 'Irrigation subsidy (up to 55% for small/marginal)',
    eligibility: ['Farmers with cultivable land', 'Water user associations'],
    howToApply: ['Apply through State Agriculture Dept', 'Submit land records and irrigation plan'],
    deadline: 'Ongoing',
    link: 'https://pmksy.gov.in/',
    categories: ['Irrigation', 'Subsidies'],
    farmerTypes: ['Small', 'Marginal', 'Large'],
    states: ['All'],
    maxLandSize: 999,
    icon: <Droplets className="text-primary-dark" size={24} />
  },
  {
    id: 'nmsa',
    name: 'National Mission for Sustainable Agriculture',
    badge: 'Central Govt',
    benefit: 'Support for sustainable practices',
    eligibility: ['All farmers adopting sustainable practices'],
    howToApply: ['Contact district agriculture office', 'Submit proposal for sustainable farming'],
    deadline: 'Ongoing',
    link: 'https://nmsa.dac.gov.in/',
    categories: ['Organic Farming', 'Subsidies'],
    farmerTypes: ['Small', 'Marginal', 'Large'],
    states: ['All'],
    maxLandSize: 999,
    icon: <Sprout className="text-primary-dark" size={24} />
  },
  {
    id: 'enam',
    name: 'eNAM (National Agriculture Market)',
    badge: 'Central Govt',
    benefit: 'Access to national electronic trading portal',
    eligibility: ['All farmers, FPOs, traders'],
    howToApply: ['Register on eNAM portal or mobile app', 'Provide bank details and KYC'],
    deadline: 'Ongoing',
    link: 'https://enam.gov.in/',
    categories: ['Equipment'], // Using equipment as a placeholder for market
    farmerTypes: ['Small', 'Marginal', 'Large'],
    states: ['All'],
    maxLandSize: 999,
    icon: <Globe className="text-primary-dark" size={24} />
  },
  {
    id: 'smam',
    name: 'Sub-Mission on Agricultural Mechanization',
    badge: 'Central Govt',
    benefit: '50-80% subsidy on agricultural equipment',
    eligibility: ['All farmers, preference to small/marginal and women'],
    howToApply: ['Register on Direct Benefit Transfer (DBT) portal', 'Select equipment and dealer'],
    deadline: 'State-specific',
    link: 'https://agrimachinery.nic.in/',
    categories: ['Equipment', 'Subsidies', 'Women Farmers'],
    farmerTypes: ['Small', 'Marginal', 'Large'],
    states: ['All'],
    maxLandSize: 999,
    icon: <Tractor className="text-primary-dark" size={24} />
  },
  {
    id: 'pkvy',
    name: 'Paramparagat Krishi Vikas Yojana',
    badge: 'Central Govt',
    benefit: '₹50,000/hectare for organic farming over 3 years',
    eligibility: ['Farmers forming clusters of 20 hectares'],
    howToApply: ['Form a cluster with nearby farmers', 'Apply through State Agriculture Dept'],
    deadline: 'Ongoing',
    link: 'https://pgsindia-ncof.gov.in/pkvy/index.aspx',
    categories: ['Organic Farming', 'Subsidies'],
    farmerTypes: ['Small', 'Marginal', 'Large'],
    states: ['All'],
    maxLandSize: 999,
    icon: <Leaf className="text-primary-dark" size={24} />
  }
];

const STATES = ['All', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];
const CATEGORIES: Category[] = ['All', 'Crop Insurance', 'Subsidies', 'Credit/Loans', 'Equipment', 'Irrigation', 'Organic Farming', 'Women Farmers'];
const FARMER_TYPES: FarmerType[] = ['All', 'Small', 'Marginal', 'Large'];

export const SchemeFinder: React.FC<SchemeFinderProps> = ({ onBack, language }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);
  
  // Eligibility Checker State
  const [checkerState, setCheckerState] = useState('All');
  const [checkerLandSize, setCheckerLandSize] = useState('');
  const [checkerFarmerType, setCheckerFarmerType] = useState<FarmerType>('All');
  const [checkerCropType, setCheckerCropType] = useState('');
  const [isCheckerActive, setIsCheckerActive] = useState(false);

  const filteredSchemes = useMemo(() => {
    return SCHEMES.filter(scheme => {
      // Search filter
      const matchesSearch = scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            scheme.benefit.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = selectedCategory === 'All' || scheme.categories.includes(selectedCategory);
      
      // State filter
      const matchesState = selectedState === 'All' || scheme.states.includes('All') || scheme.states.includes(selectedState);
      
      // Eligibility Checker filter
      let matchesChecker = true;
      if (isCheckerActive) {
        const landSizeNum = parseFloat(checkerLandSize);
        if (!isNaN(landSizeNum) && landSizeNum > scheme.maxLandSize) {
          matchesChecker = false;
        }
        if (checkerFarmerType !== 'All' && !scheme.farmerTypes.includes(checkerFarmerType)) {
          matchesChecker = false;
        }
        if (checkerState !== 'All' && !scheme.states.includes('All') && !scheme.states.includes(checkerState)) {
          matchesChecker = false;
        }
      }

      return matchesSearch && matchesCategory && matchesState && matchesChecker;
    });
  }, [searchQuery, selectedCategory, selectedState, isCheckerActive, checkerLandSize, checkerFarmerType, checkerState]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <header className="bg-primary-dark text-white p-4 pt-20 pb-6 rounded-b-[24px] shadow-lg sticky top-0 z-30">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="font-bold text-xl leading-none">Scheme Finder</h1>
            <p className="text-xs text-[#F9A825] font-bold mt-1">Govt. Agricultural Schemes</p>
          </div>
        </div>
        
        {/* Language Banner */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg py-1.5 px-3 flex items-center justify-center gap-2 mb-4">
          <Globe size={14} className="text-[#F9A825]" />
          <span className="text-[10px] font-bold tracking-wider uppercase">Available in Kannada, Hindi & English</span>
        </div>

        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <input 
              className="w-full bg-white text-gray-900 placeholder-gray-500 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#F9A825] shadow-inner" 
              placeholder="Search schemes, benefits..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${showFilters ? 'bg-[#F9A825] text-primary-dark' : 'bg-white/20 text-white hover:bg-white/30'}`}
          >
            <Filter size={20} />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3">
                <label className="block text-[10px] font-bold text-white/80 uppercase tracking-wider mb-1.5">Filter by State</label>
                <select 
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full bg-white text-gray-900 border-none rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#F9A825] outline-none"
                >
                  {STATES.map(state => <option key={state} value={state}>{state}</option>)}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 p-4 pb-24 space-y-6 lg:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-1 space-y-6">
            {/* Eligibility Checker Widget */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#F9A825]/10 p-4 border-b border-[#F9A825]/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-[#F9A825]" size={20} />
              <h2 className="font-bold text-primary-dark">Check Eligibility</h2>
            </div>
            <button 
              onClick={() => setIsCheckerActive(!isCheckerActive)}
              className={`text-xs font-bold px-3 py-1 rounded-full ${isCheckerActive ? 'bg-primary-dark text-white' : 'bg-gray-200 text-gray-600'}`}
            >
              {isCheckerActive ? 'Active' : 'Enable'}
            </button>
          </div>
          
          <AnimatePresence>
            {isCheckerActive && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="p-4 space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">State</label>
                    <select 
                      value={checkerState}
                      onChange={(e) => setCheckerState(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary-dark focus:border-transparent"
                    >
                      {STATES.map(state => <option key={state} value={state}>{state}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Land Size (Acres)</label>
                    <input 
                      type="number" 
                      value={checkerLandSize}
                      onChange={(e) => setCheckerLandSize(e.target.value)}
                      placeholder="e.g. 2.5"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary-dark focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Farmer Type</label>
                    <select 
                      value={checkerFarmerType}
                      onChange={(e) => setCheckerFarmerType(e.target.value as FarmerType)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary-dark focus:border-transparent"
                    >
                      {FARMER_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Crop Type</label>
                    <input 
                      type="text" 
                      value={checkerCropType}
                      onChange={(e) => setCheckerCropType(e.target.value)}
                      placeholder="e.g. Wheat"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary-dark focus:border-transparent"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
          </div>
          <div className="lg:col-span-2 space-y-6">

        {/* Categories */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 -mx-4 px-4">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === category 
                  ? 'bg-primary-dark text-white shadow-md' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-dark/50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-gray-600 uppercase tracking-widest">
              {isCheckerActive ? 'Eligible Schemes' : 'Available Schemes'}
            </h2>
            <span className="text-xs font-bold bg-[#E8F5E9] text-primary-dark px-2 py-1 rounded-md">
              {filteredSchemes.length} found
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredSchemes.map((scheme, index) => (
                <motion.div 
                  key={scheme.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
                >
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#E8F5E9] rounded-xl flex items-center justify-center shrink-0">
                          {scheme.icon}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[#F9A825] uppercase tracking-wider bg-[#F9A825]/10 px-2 py-0.5 rounded-sm">
                            {scheme.badge}
                          </span>
                          <h3 className="font-black text-lg text-gray-900 leading-tight mt-1">{scheme.name}</h3>
                        </div>
                      </div>
                      {isCheckerActive && (
                        <div className="bg-green-100 text-green-700 p-1 rounded-full">
                          <CheckCircle2 size={16} />
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-[#F8F9FA] p-3 rounded-xl mb-4 border border-gray-100">
                      <p className="text-sm font-bold text-primary-dark flex items-center gap-2">
                        <span className="text-lg">💰</span> {scheme.benefit}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Eligibility</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {scheme.eligibility.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-[#F9A825] mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">How to Apply</h4>
                        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                          {scheme.howToApply.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-xs">
                      <span className="font-bold text-gray-500">Deadline: </span>
                      <span className="font-bold text-gray-900">{scheme.deadline}</span>
                    </div>
                    <a 
                      href={scheme.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary-dark text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary-dark/90 transition-colors shadow-md shadow-primary-dark/20"
                    >
                      Apply Now
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredSchemes.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <Search size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No schemes found</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">Try adjusting your filters or eligibility criteria to see more results.</p>
              </div>
            )}
          </div>
        </div>
          </div>
        </div>
      </main>
    </div>
  );
};
