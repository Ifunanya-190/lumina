import React from 'react';
import { Link } from 'react-router-dom';
import { FaUtensils, FaPuzzlePiece, FaDumbbell, FaMusic, FaPaintBrush, FaChess } from 'react-icons/fa';

// Import your local images
import cakeImage from '../assets/Cake.jpg';
import origamiImage from '../assets/Origami.jpg';
import yogaImage from '../assets/Yoga.jpg';
import guitarImage from '../assets/Guitar.jpg';
import paintingImage from '../assets/Painting.jpg';
import chessImage from '../assets/Chess.jpg';

const CategoriesPage = () => {
  const categories = [
    {
      id: 1,
      name: 'Cooking',
      description: 'Delicious recipes and cooking techniques',
      tutorialCount: 8,
      icon: FaUtensils,
      color: 'bg-red-500',
      image: cakeImage // Using your local cake image
    },
    {
      id: 2,
      name: 'Crafts',
      description: 'Creative DIY projects and handmade crafts',
      tutorialCount: 12,
      icon: FaPuzzlePiece,
      color: 'bg-blue-500',
      image: origamiImage // Using your local origami image
    },
    {
      id: 3,
      name: 'Fitness',
      description: 'Workouts, yoga, and healthy living',
      tutorialCount: 6,
      icon: FaDumbbell,
      color: 'bg-green-500',
      image: yogaImage // Using your local yoga image
    },
    {
      id: 4,
      name: 'Music',
      description: 'Learn instruments and music theory',
      tutorialCount: 5,
      icon: FaMusic,
      color: 'bg-purple-500',
      image: guitarImage // Using your local guitar image
    },
    {
      id: 5,
      name: 'Art',
      description: 'Painting, drawing, and creative arts',
      tutorialCount: 7,
      icon: FaPaintBrush,
      color: 'bg-pink-500',
      image: paintingImage // Using your local painting image
    },
    {
      id: 6,
      name: 'Games',
      description: 'Board games, chess, and strategy',
      tutorialCount: 4,
      icon: FaChess,
      color: 'bg-yellow-500',
      image: chessImage // Using your local chess image
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Browse Categories</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Explore our collection of fun and easy tutorials organized by category
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map(category => {
          const IconComponent = category.icon;
          return (
            <Link 
              key={category.id} 
              to={`/tutorials?category=${category.name.toLowerCase()}`}
              className="group"
            >
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <div className={`${category.color} text-white rounded-full w-12 h-12 flex items-center justify-center text-xl`}>
                      <IconComponent />
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {category.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {category.tutorialCount} tutorials
                    </span>
                    <span className="text-purple-600 font-semibold group-hover:underline">
                      Explore →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CategoriesPage;