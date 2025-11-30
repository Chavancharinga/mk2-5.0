import { Business, NicheType } from '../types';

export const mockSearchPlaces = async (city: string, niche: NicheType): Promise<Business[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const citySafe = city || "Sua Cidade";

  // Generate plausible fake data based on niche
  const businesses: Business[] = [
    {
      id: '1',
      name: `${niche} Premium ${citySafe}`,
      address: `Av. Principal, 100, ${citySafe}`,
      rating: 4.8,
      reviews: 124,
      phone: '(11) 99999-0001',
      image: 'https://picsum.photos/400/300?random=1'
    },
    {
      id: '2',
      name: `Studio ${niche} Elite`,
      address: `Rua das Flores, 45, ${citySafe}`,
      rating: 4.5,
      reviews: 89,
      phone: '(11) 99999-0002',
      image: 'https://picsum.photos/400/300?random=2'
    },
    {
      id: '3',
      name: `${niche} do Bairro`,
      address: `Praça Central, 12, ${citySafe}`,
      rating: 4.9,
      reviews: 210,
      phone: '(11) 99999-0003',
      image: 'https://picsum.photos/400/300?random=3'
    },
    {
      id: '4',
      name: `Nova ${niche} Express`,
      address: `Av. Comercial, 880, ${citySafe}`,
      rating: 4.2,
      reviews: 45,
      phone: '(11) 99999-0004',
      image: 'https://picsum.photos/400/300?random=4'
    }
  ];

  return businesses;
};
