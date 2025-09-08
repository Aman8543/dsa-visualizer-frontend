import { AiOutlineArrowRight } from 'react-icons/ai';

import { GlobalContext } from '../app';
import SubCard from './subCard';
import { NavLink } from 'react-router';
import { useContext } from 'react';

export default function CardsPage() {
    // We'll add an icon component to each category object for easy rendering
    const globaldata = useContext(GlobalContext);
    
    const algorithmCategories = globaldata;
   
    return (
        // Use a slightly darker background for the whole page container for contrast
        <div className="p-4 md:p-8 bg-base-200 min-h-screen ">
            <div className="max-w-7xl mx-auto">
                {/* 1. Page Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">Algorithm Visualizer</h1>
                    <p className="text-lg text-base-content/70">
                        Explore and understand popular algorithms from various domains.
                    </p>
                </div>

                {/* 2. Responsive Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {algorithmCategories.map((category, index) => {
                        return (
                           // 3. Enhanced Card with Hover Effects
                           <div key={index} className="card bg-base-100 shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
                                <div className="card-body">
                                    {/* Card Title with Icon */}
                                    <h2 className="card-title text-2xl mb-4">
                                        {category.icon}
                                        <span className="ml-3">{category.title}</span>
                                    </h2>
                                    
                                    {/* 4. Displaying items as Badges */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {category.items.map((item, itemIndex) => (
                                            <div key={itemIndex} className="badge badge-outline">
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Card actions are pushed to the bottom */}
                                    <div className="card-actions justify-end mt-auto pt-4">
                                        <NavLink to={`${category.title}`} className="btn btn-primary btn-sm md:btn-md" onClick={<SubCard arrdata={category.items} ></SubCard>} >
                                            Explore
                                            <AiOutlineArrowRight className="ml-2"/>
                                        </NavLink>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}