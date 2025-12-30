"use client";
import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface Testimonial {
  text: string;
  image?: string;
  name?: string;
  role?: string;
}

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role }, i) => (
                <div className="rounded-2xl border border-gray-100 bg-white shadow-md overflow-hidden w-full" key={i}>
                   {image && (
                     <div className="relative w-full">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img
                         src={image}
                         alt={name || "Depoimento"}
                         className="w-full h-auto object-contain"
                       />
                     </div>
                   )}
                   <div className="p-4">
                     {text && <div className="text-gray-700 text-sm italic mb-2">"{text}"</div>}
                     <div className="flex flex-col">
                       {/* Remove repeated name if it's the same for everyone or simplify */}
                       {/* {name && <div className="font-bold text-gray-900 text-sm">{name}</div>} */}
                       {/* {role && <div className="text-xs font-bold text-[#FF4D4D] uppercase">{role}</div>} */}
                       <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Comentário Real do Canal</div>
                     </div>
                   </div>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
};

export const TestimonialsMarquee = ({ 
  testimonials, 
  title, 
  subtitle, 
  caption 
}: { 
  testimonials: Testimonial[], 
  title: string, 
  subtitle?: string, 
  caption?: React.ReactNode 
}) => {
  
  // Divide testimonials into 3 columns for desktop, 2 for tablet, 1 for mobile (handled by CSS hiding)
  const third = Math.ceil(testimonials.length / 3);
  const firstColumn = testimonials.slice(0, third);
  const secondColumn = testimonials.slice(third, third * 2);
  const thirdColumn = testimonials.slice(third * 2);

  // If we don't have enough testimonials for 3 columns, duplicate or redistribute?
  // For now, let's assume we pass enough, or just repeat them if array is small.
  // Actually, the original code slices. If array is small, some cols are empty.
  // Let's ensure at least some data in cols if possible, but the user usually provides a list.
  
  const mappedTestimonials = testimonials.map((t, index) => ({
    ...t,
    name: t.name || 'Aluna Barriga 30', // Default if missing
    role: t.role || 'Resultado Real'
  }))

  return (
    <div className="bg-white my-12 relative overflow-hidden">
      <div className="container z-10 mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10">
           <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight mb-3">
            {title}
          </h3>
          {subtitle && <p className="text-gray-600 text-base md:text-lg">{subtitle}</p>}
        </div>

        <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[600px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn.length > 0 ? firstColumn : testimonials} duration={15} className="w-full md:w-1/2 lg:w-1/3" />
          <TestimonialsColumn testimonials={secondColumn.length > 0 ? secondColumn : testimonials} className="hidden md:block w-1/2 lg:w-1/3" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn.length > 0 ? thirdColumn : testimonials} className="hidden lg:block w-1/3" duration={17} />
        </div>

        {caption && (
          <div className="text-center max-w-2xl mx-auto mt-8 space-y-4">
            {caption}
          </div>
        )}
      </div>
    </div>
  );
};
