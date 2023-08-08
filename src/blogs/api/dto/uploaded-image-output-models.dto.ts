interface IUploadedImageOutputModelDto {
  url: string;
  width: number;
  height: number;
  fileSize: number;
}

export interface IUploadedBlogImagesOutputModelDto {
  wallpaper: IUploadedImageOutputModelDto;
  main: IUploadedImageOutputModelDto[];
}
