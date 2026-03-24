import { useState } from 'react';
import { Code2, Bell, Search, ChevronDown, CheckCircle, X } from 'lucide-react';

interface FindInterviewerProps {
  onNavigate: (page: string) => void;
}

interface Interviewer {
  id: number;
  name: string;
  avatar: string;
  initials: string;
  skills: Array<{
    name: string;
    bgColor: string;
    textColor: string;
  }>;
  availability: string;
}

export default function FindInterviewer({ onNavigate }: FindInterviewerProps) {
  const interviewers: Interviewer[] = [
    {
      id: 1,
      name: 'R. Armaan',
      avatar: 'A',
      initials: 'RA',
      skills: [
        { name: 'C++', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
        { name: 'MERN', bgColor: 'bg-green-100', textColor: 'text-green-700' },
      ],
      availability: 'Today, 4:00 PM',
    },
    {
      id: 2,
      name: 'Riya',
      avatar: 'R',
      initials: 'RY',
      skills: [
        { name: 'SQL', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
        { name: 'Python', bgColor: 'bg-green-100', textColor: 'text-green-700' },
      ],
      availability: 'Today, 6:30 PM',
    },
    {
      id: 3,
      name: 'Dhruv',
      avatar: 'D',
      initials: 'DH',
      skills: [
        { name: 'Node.js', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
        { name: 'MERN', bgColor: 'bg-green-100', textColor: 'text-green-700' },
      ],
      availability: 'Tomorrow, 11:00 AM',
    },
    {
      id: 4,
      name: 'Ishani Patel',
      avatar: 'I',
      initials: 'IP',
      skills: [
        { name: 'React', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
        { name: 'JavaScript', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
      ],
      availability: 'Tomorrow, 2:45 PM',
    },
    {
      id: 5,
      name: 'Karan Sharma',
      avatar: 'K',
      initials: 'KS',
      skills: [
        { name: 'Java', bgColor: 'bg-red-100', textColor: 'text-red-700' },
        { name: 'Machine Learning', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
      ],
      availability: 'Apr 26, 10:00 AM',
    },
    {
      id: 6,
      name: 'Smriti',
      avatar: 'S',
      initials: 'SM',
      skills: [
        { name: 'Front-End', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
        { name: 'Android', bgColor: 'bg-green-100', textColor: 'text-green-700' },
      ],
      availability: 'Apr 26, 3:00 PM',
    },
  ];

  // --- NEW STATE & LOGIC ---
  const [filterTopic, setFilterTopic] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInterviewer, setSelectedInterviewer] = useState<Interviewer | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Filter logic checking the skill objects
  const filteredInterviewers = filterTopic === 'All' 
    ? interviewers 
    : interviewers.filter(person => person.skills.some(skill => skill.name === filterTopic));

  const handleBookClick = (person: Interviewer) => {
    setSelectedInterviewer(person);
    setIsModalOpen(true);
    setIsSuccess(false);
  };

  const confirmBooking = () => {
    setIsSuccess(true);
    setTimeout(() => {
      setIsModalOpen(false);
      onNavigate('dashboard');
    }, 2000); // Redirect to dashboard after 2 seconds
  };
  // -------------------------

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-xl">
                  <Code2 className="w-6 h-6 text-white" />
                </div>
                <h1 className="ml-2 text-xl font-bold text-gray-900">Code-Pair</h1>
              </button>

              <div className="hidden md:flex items-center space-x-1">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Dashboard
                </button>
                <button className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg">
                  Sessions
                </button>
                <button className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                  Leaderboard
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">SK</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 hidden md:block">Sanjay K</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-[20px] shadow-md p-6 mb-8 border border-gray-100 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
          <div className="relative">
            {/* Added Select Dropdown for Filter Logic */}
            <select
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              className="px-6 py-3 pl-4 pr-10 appearance-none rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium text-gray-700 bg-white cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
            >
              <option value="All">Filter by Topic (All)</option>
              <option value="React">React</option>
              <option value="MERN">MERN</option>
              <option value="Python">Python</option>
              <option value="C++">C++</option>
              <option value="Java">Java</option>
              <option value="Node.js">Node.js</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-4">
          {filteredInterviewers.map((interviewer) => (
            <div
              key={interviewer.id}
              className="bg-white rounded-[16px] shadow-md p-6 hover:shadow-lg transition-all border border-gray-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-6 flex-1">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">{interviewer.initials}</span>
                  </div>
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{interviewer.name}</h3>
                  <div className="flex gap-2 mt-2">
                    {interviewer.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-1 ${skill.bgColor} ${skill.textColor} text-xs font-semibold rounded-full`}
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <p className="text-sm font-medium text-gray-600 whitespace-nowrap">{interviewer.availability}</p>
                <button 
                  onClick={() => handleBookClick(interviewer)}
                  className="px-5 py-2.5 bg-blue-50 text-blue-600 font-semibold text-sm rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 whitespace-nowrap"
                >
                  Book (-1 Credit)
                  <span>→</span>
                </button>
              </div>
            </div>
          ))}
          
          {filteredInterviewers.length === 0 && (
            <div className="text-center py-10 text-gray-500 font-medium bg-white rounded-[16px] border border-gray-100">
              No interviewers currently available for this topic.
            </div>
          )}
        </div>
      </main>

      {/* NEW: Booking Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md p-8 relative animate-in fade-in zoom-in duration-200">
            {!isSuccess ? (
              <>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-6 h-6" />
                </button>
                <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">Confirm Booking</h3>
                <p className="text-center text-gray-500 mb-8 font-medium leading-relaxed">
                  Book a mock interview with <span className="font-bold text-gray-900">{selectedInterviewer?.name}</span> for <span className="text-gray-900">{selectedInterviewer?.availability}</span>? This will deduct 1 credit.
                </p>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-xl font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmBooking} 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/30"
                  >
                    Confirm & Book
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
                <p className="text-gray-500 font-medium">Redirecting to your dashboard...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}