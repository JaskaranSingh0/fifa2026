"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlobeTeamData } from "@/lib/data/globe-teams";

interface Props {
  country: GlobeTeamData;
  onClose: () => void;
}

export default function SelectedCountryOverlay({ country, onClose }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between py-12 z-10"
    >
      <div className="flex-1 flex flex-col justify-center items-center mt-32">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <h1 className="text-white text-6xl md:text-8xl font-light tracking-[0.2em] uppercase">
            {country.name}
          </h1>
          <div className="mt-6 flex space-x-8 justify-center opacity-70">
            {country.group && (
              <span className="text-white text-sm tracking-[0.3em] uppercase">
                GROUP {country.group}
              </span>
            )}
            {country.ranking && (
              <span className="text-white text-sm tracking-[0.3em] uppercase">
                &nbsp;RANK {country.ranking}
              </span>
            )}
          </div>
        </motion.div>
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="pointer-events-auto text-white/50 hover:text-white transition-colors duration-300 text-sm tracking-[0.2em] uppercase pb-8"
      >
        BACK TO GLOBE
      </motion.button>
    </motion.div>
  );
}
