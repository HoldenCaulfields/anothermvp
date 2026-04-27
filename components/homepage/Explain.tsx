import Image from "next/image";

export default function Explain() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-7xl pb-8 items-center mx-auto px-4 sm:px-8">
            <div className="hidden md:block">
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-6 uppercase">
                    Quy trình vận hành
                </h2>
                <div className="space-y-6">
                    {[
                        { step: "01", title: "Xác thực ý tưởng", desc: "Đăng ý tưởng của bạn và xem phản hồi từ cộng đồng. Số lượng 'vote' là minh chứng cho tiềm năng thị trường." },
                        { step: "02", title: "Xây dựng đội ngũ", desc: "Tìm kiếm dev, marketer, editor cùng chí hướng để bắt tay vào thực hiện dự án." },
                        { step: "03", title: "Quản lý & Triển khai", desc: "Sử dụng công cụ quản lý tiến độ tích hợp để bám sát roadmap và ra mắt sản phẩm." }
                    ].map((item) => (
                        <div key={item.step} className="flex gap-4">
                            <span className="text-2xl font-black text-rose-600/50">{item.step}</span>
                            <div>
                                <h4 className="font-bold text-lg text-slate-900">{item.title}</h4>
                                <p className="text-slate-500 text-sm">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-slate-200 rounded-2xl md:rounded-4xl overflow-hidden shadow-inner transition-transform duration-300 hover:scale-105 p-4  flex items-center justify-center">
                <Image
                    src="/explain.png"
                    alt="explain image"
                    className="w-full h-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg object-contain rounded-2xl"
                    width={800}
                    height={600}
                    priority
                />
            </div>
        </div>
    );
}