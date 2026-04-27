import { Smartphone, Apple, Play, Globe } from 'lucide-react';

export default function Download() {
    return (
        <section id="download" className="py-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-gray-100 via-gray-50 to-white"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-3xl p-12 md:p-16 relative overflow-hidden shadow-2xl border border-gray-700">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-linear-to-tr from-pink-500/20 to-yellow-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

                    <div className="relative z-10 text-center max-w-3xl mx-auto">
                        <Smartphone className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 text-blue-400 animate-bounce" />
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Tải app ngay hôm nay</h2>
                        <p className="hidden md:block text-xl mb-12 text-gray-300">
                            Trải nghiệm LovelyNet mọi lúc mọi nơi với ứng dụng di động
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center  gap-4 md:gap-6">
                            {/* App Store */}
                            <button className="flex items-center justify-center cursor-pointer sm:justify-start space-x-3 w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-gray-900 font-semibold shadow-lg border border-gray-200 hover:shadow-xl hover:shadow-blue-400/30 transition-all duration-300 transform hover:-translate-y-1">
                                <Apple className="w-6 h-6 text-gray-800 group-hover:scale-110 transition-transform duration-300" />
                                <div className="text-left">
                                    <div className="text-xs text-gray-600">Tải về từ</div>
                                    <div className="text-lg font-bold">App Store</div>
                                </div>
                            </button>

                            {/* Google Play */}
                            <button className="flex items-center cursor-pointer justify-center sm:justify-start space-x-3 w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-gray-900 font-semibold shadow-lg border border-gray-200 hover:shadow-xl hover:shadow-purple-400/30 transition-all duration-300 transform hover:-translate-y-1">
                                <Play className="w-6 h-6 text-gray-800 group-hover:scale-110 transition-transform duration-300" />
                                <div className="text-left">
                                    <div className="text-xs text-gray-600">Tải về từ</div>
                                    <div className="text-lg font-bold">Google Play</div>
                                </div>
                            </button>

                            {/* Web App */}
                            <button className="flex items-center cursor-pointer justify-center sm:justify-start space-x-3 w-full sm:w-auto px-8 py-4 rounded-xl bg-gray-700 text-white font-semibold shadow-lg border border-gray-600 hover:shadow-xl hover:shadow-gray-500/30 transition-all duration-300 transform hover:-translate-y-1">
                                <Globe className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
                                <div className="text-left">
                                    <div className="text-xs text-gray-300">Truy cập</div>
                                    <div className="text-lg font-bold">Web App</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}