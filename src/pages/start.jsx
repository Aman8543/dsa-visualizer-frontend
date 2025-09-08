import { ArrowRight, Play, Code, Brain, Zap, Users, Github, Star, BookOpen, Timer, Target } from "lucide-react"
import Signup from "./signUp"
import { useNavigate,NavLink } from 'react-router';

export default function DSAVisualizerLanding() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 text-white">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <a href="/" className="flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
            <Code className="h-5 w-5 text-white" />
          </div>
          <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            DSA Visualizer
          </span>
        </a>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <a href="#features" className="text-sm font-medium text-gray-300 hover:text-blue-400 transition-colors">
            Features
          </a>
          <NavLink to={"/home"} className="text-sm font-medium text-gray-300 hover:text-blue-400 transition-colors">
            Algorithms
          </NavLink>
          <a href="#demo" className="text-sm font-medium text-gray-300 hover:text-blue-400 transition-colors">
            Demo
          </a>
          {/* <NavLink to={'/signup'} className="text-sm font-medium text-gray-300 hover:text-blue-400 transition-colors cursor-pointer " >Sign Up</NavLink> */}
      
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 text-center px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center px-4 py-2 text-blue-300 bg-blue-900/30 border border-blue-500/20 rounded-full text-sm backdrop-blur-sm">
              <Zap className="w-4 h-4 mr-2 text-blue-400" />
              For better experience use desktop
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-300 leading-tight">
              Master Data Structures & Algorithms
            </h1>

            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Learn DSA concepts through interactive visualizations. Watch algorithms come to life with animations and
              real-time code execution.
            </p>
           

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-8 py-4 rounded-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                <Play className="w-5 h-5" />
                <NavLink to={"/home"} >
                Start Learning
                </NavLink>
                <ArrowRight className="w-5 h-5" />
              </button>
              {/* <a
                href="https://github.com"
                className="border-2 border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-8 py-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:bg-gray-800/50"
              >
                <Github className="w-5 h-5" />
                View on GitHub
              </a> */}
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-400 pt-8">
              <div className="flex gap-2 items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-gray-300">4/5 rating</span>
              </div>
              <div className="flex gap-2 items-center">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">50+ students</span>
              </div>
              <div className="flex gap-2 items-center">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">50+ algorithms</span>
              </div>
            </div>
          </div>
        </section>

        {/* Demo */}
        <section id="demo" className="w-full py-20 bg-gray-800/50 text-center">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-4xl font-bold mb-4 text-white">See It In Action</h2>
            <p className="text-gray-300 mb-12 text-lg">
              Watch how sorting algorithms work with real-time visualizations
            </p>

            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-900 border border-gray-700">
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <img
                  src="img/demo.png?height=400&width=800"
                  alt="DSA Visualizer Demo"
                  className="w-full h-full object-cover opacity-80"
                />
                <button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-xl flex items-center gap-3 hover:bg-white/20 transition-all duration-200 shadow-lg">
                  <Play className="w-6 h-6" />
                  <NavLink to={"/home"} >
                  <span className="font-semibold">Watch Demo</span>
                  </NavLink>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="w-full py-20 bg-gradient-to-br from-gray-900 to-slate-800">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-white">Powerful Features</h2>
              <p className="text-gray-300 text-lg">Everything you need to master algorithms and data structures</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Brain className="w-6 h-6" />,
                  title: "Interactive Visualizations",
                  desc: "Step-by-step animations with real-time updates and detailed explanations.",
                  color: "from-blue-500 to-cyan-500",
                },
                // {
                //   icon: <Code className="w-6 h-6" />,
                //   title: "Code Playground",
                //   desc: "Write and execute code with syntax highlighting and instant feedback.",
                //   color: "from-purple-500 to-pink-500",
                // },
                {
                  icon: <Timer className="w-6 h-6" />,
                  title: "Performance Analysis",
                  desc: "Detailed time and space complexity analysis with visual comparisons.",
                  color: "from-green-500 to-emerald-500",
                },
                {
                  icon: <Target className="w-6 h-6" />,
                  title: "Guided Learning",
                  desc: "Structured learning paths with practice problems and assessments.",
                  color: "from-orange-500 to-red-500",
                },
                // {
                //   icon: <Users className="w-6 h-6" />,
                //   title: "Community Driven",
                //   desc: "Join learners worldwide, share solutions, and get help when needed.",
                //   color: "from-indigo-500 to-purple-500",
                // },
                {
                  icon: <BookOpen className="w-6 h-6" />,
                  title: "Comprehensive Library",
                  desc: "100+ algorithms with clear explanations and implementation examples.",
                  color: "from-teal-500 to-blue-500",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="group p-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl hover:bg-gray-700/50 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <div
                    className={`w-12 h-12 mb-4 bg-gradient-to-r ${feature.color} text-white flex items-center justify-center rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-200`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-white group-hover:text-blue-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          id="pricing"
          className="w-full py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-center text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-4xl mx-auto space-y-8 px-4">
            <h2 className="text-4xl md:text-5xl font-bold">Ready to Master DSA?</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Join thousands of developers improving their coding skills with our interactive visualizer platform.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                <Play className="w-5 h-5" />
                <NavLink to={"/home"} >
                  Start 
                </NavLink>
                
              </button>
      
            </div>

            
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 border-t border-gray-700 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-gray-400 mb-4 sm:mb-0">© 2024 DSA Visualizer. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            {/* <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </a> */}
            <a  className="text-gray-400 hover:text-white transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
