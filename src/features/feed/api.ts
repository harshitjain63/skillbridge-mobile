import { useQuery } from '@tanstack/react-query';
import { StatusBar } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { api } from '@/api/client';

export type Course = {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  instructor: string;
  price: number;
  rating: number;
  category: string;
  brand: string;
  images: string[];
};

export async function fetchCourses(): Promise<Course[]> {
  const [productsRes, usersRes] = await Promise.all([
    api.get('/public/randomproducts'),
    api.get('/public/randomusers'),
  ]);

  const products = productsRes.data?.data?.data ?? [];
  const users = usersRes.data?.data?.data ?? [];

  return products.map((item: any, index: number) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    thumbnail: item.thumbnail,
    instructor: `${users[index % users.length]?.name?.first ?? ''} ${
      users[index % users.length]?.name?.last ?? ''
    }`,
    price: item.price,
    rating: item.rating,
    category: item.category,
    brand: item.brand,
    images: item.images,
  }));
}

export function useCourses() {
  const query = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  });

  if (query.isError) {
    showMessage({
      message: query.error.message || 'No Data Found!!',
      type: 'danger',
      icon: 'danger',
      statusBarHeight: StatusBar.currentHeight,
      position: 'top',
    });
  }

  return query;
}
