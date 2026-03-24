import { Code2, Bell, Search, ChevronDown } from 'lucide-react';

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
        <div className="bg-white rounded-[20px] shadow-md p-6 mb-8 border border-gray-100">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
            <button className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium text-gray-700">
              Filter by Topic
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {interviewers.map((interviewer) => (
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
                <button className="px-5 py-2.5 bg-blue-50 text-blue-600 font-semibold text-sm rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 whitespace-nowrap">
                  Book (-1 Credit)
                  <span>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
