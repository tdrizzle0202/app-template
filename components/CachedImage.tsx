import React from 'react';
import { Image, ImageProps } from 'expo-image';

type CachedImageProps = Omit<ImageProps, 'cachePolicy'> & {
  recyclingKey?: string;
};

export const CachedImage = ({
  transition = 200,
  placeholder,
  recyclingKey,
  ...props
}: CachedImageProps) => {
  return (
    <Image
      {...props}
      cachePolicy="memory-disk"
      transition={transition}
      placeholder={placeholder}
      recyclingKey={recyclingKey}
    />
  );
};
