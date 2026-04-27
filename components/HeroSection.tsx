"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const heroSlides = [
    {
        src: "/mvvp.jpg",           // Build MVP
        alt: "Xây dựng MVP nhanh chóng",
        title: "Build MVP",
        subtitle: "Từ ý tưởng đến sản phẩm đầu tiên chỉ trong vài tuần"
    },
    {
        src: "/ideas.png",      // Create YouTube
        alt: "Tạo nội dung YouTube",
        title: "Create YouTube",
        subtitle: "Xây dựng kênh và nội dung mang dấu ấn cá nhân"
    },
    {
        src: "/cinema.jpeg",         // Làm phim
        alt: "Sản xuất phim và video",
        title: "Làm Phim",
        subtitle: "Biến câu chuyện của bạn thành tác phẩm điện ảnh"
    },
    {
        src: "/creative.jpg",     // Creative process + icons
        alt: "Quá trình sáng tạo",
        title: "Tạo Ra Những Thứ Ngớ Ngẩn",
        subtitle: "Nhưng mang đậm bản sắc của bạn"
    },
    {
        src: "/teams.png",         // Xây dựng đội nhóm
        alt: "Xây dựng đội nhóm sáng tạo",
        title: "Team Up",
        subtitle: "Kết nối những người dám khác biệt để tạo ra giá trị lớn"
    },
];

export default function HeroSection() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % heroSlides.length);
        }, 8000); 

        return () => clearInterval(interval);
    }, []);

    const prevSlide = () => setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    const nextSlide = () => setCurrent((prev) => (prev + 1) % heroSlides.length);

    return (
        <section className="relative w-full overflow-hidden">
            <div className="relative w-full h-[42vh] sm:h-[48vh] md:h-[55vh] lg:h-[60vh] xl:h-[65vh]">
                <AnimatePresence mode="wait">
                    {heroSlides.map((slide, index) => (
                        index === current && (
                            <motion.div
                                key={index}
                                className="absolute inset-0"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                            >
                                <Image
                                    src={slide.src}
                                    alt={slide.alt}
                                    fill
                                    priority={index === 0}
                                    className="object-cover"
                                    sizes="100vw"
                                    quality={70}
                                />

                                {/* Optional dark overlay để text dễ đọc hơn */}
                                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />
                            </motion.div>
                        )
                    ))}
                </AnimatePresence>

                {/* Text content - Responsive tốt hơn */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4 z-10">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-5 py-2 mb-6 text-rose-400 font-bold text-[10px] md:text-sm uppercase tracking-[0.25em] bg-rose-500/10 rounded-full border border-rose-500/30"
                    >
                        The world is your oyster
                    </motion.span>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter leading-[0.95] mb-6"
                    >
                        Đừng chôn vùi <span className="text-rose-500">ý tưởng</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-xl sm:max-w-2xl mx-auto text-slate-200 text-sm sm:text-lg md:text-xl leading-relaxed font-medium px-2"
                    >
                        Nền tảng kết nối những người có ý tưởng mới với những người có kỹ năng để biến ý tưởng thành hiện thực. 
                    </motion.p>
                </div>
            </div>

            {/* Navigation buttons - Responsive size */}
            <button
                onClick={prevSlide}
                className="absolute z-20 top-1/2 -translate-y-1/2 left-0 sm:left-8 py-3 text-white hover:text-rose-400 transition-all duration-300 hover:scale-110"
                aria-label="Previous slide"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <button
                onClick={nextSlide}
                className="absolute z-20 top-1/2 -translate-y-1/2 right-0 sm:right-8 py-3 text-white hover:text-rose-400 transition-all duration-300 hover:scale-110"
                aria-label="Next slide"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Dots indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                {heroSlides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${i === current
                                ? "bg-white scale-125 shadow-[0_0_12px_rgba(255,255,255,0.9)]"
                                : "bg-white/50 hover:bg-white/80"
                            }`}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}