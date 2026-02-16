import React from 'react';
import { useParams } from 'react-router-dom';
import AllSongsByCategory from '../../components/AllSongsByCategory';

export function Category() {
  const { category } = useParams<{ category: string }>();
  return <AllSongsByCategory />;
}
