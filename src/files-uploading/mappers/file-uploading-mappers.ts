import { FileUploadingEntity } from '../entities/file-uploading.entity';
import { ImageType } from '../../common/enums';
import {
  IBlogFileUploadingOutputModelDto,
  IPostFileUploadingOutputModelDto,
} from '../api/dto/file-uploading-output-models.dto';

const BASE_URL = 'https://devbucket1.storage.yandexcloud.net/';

export const mapBlogFileUploadingEntityToBlogFileUploadingOutputModel = (
  fileUploadings: FileUploadingEntity[],
): IBlogFileUploadingOutputModelDto => {
  const wallpaper = fileUploadings.find(
    (item) => item.type === ImageType.WALLPAPER,
  );
  const mainFiles = fileUploadings.filter(
    (item) => item.type === ImageType.MAIN,
  );

  return {
    wallpaper: wallpaper
      ? {
          url: `${BASE_URL}${wallpaper.url}`,
          width: wallpaper.width,
          height: wallpaper.height,
          fileSize: wallpaper.size,
        }
      : null,
    main: mainFiles.map((item) => ({
      url: item && `${BASE_URL}${item.url}`,
      width: item.width,
      height: item.height,
      fileSize: item.size,
    })),
  };
};

export const mapPostFileUploadingEntityToPostFileUploadingOutputModel = (
  fileUploadings: FileUploadingEntity[],
): IPostFileUploadingOutputModelDto => ({
  main: fileUploadings.map((item) => ({
    url: item?.url,
    width: item?.width,
    height: item?.height,
    fileSize: item?.size,
  })),
});
