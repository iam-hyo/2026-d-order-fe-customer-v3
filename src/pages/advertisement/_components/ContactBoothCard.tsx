import styled from 'styled-components';
import { IMAGE_CONSTANTS } from '@constants/ImageConstants';

type Status = 'AVAILABLE' | 'SOON' | 'FULL';

type Props = {
  hostName: string;
  boothImage?: string;
  location: string;
  remaining: number;
  capacity: number;
  status: Status;
};

const getStatusColor = (status: Status) =>
  status === 'AVAILABLE' ? '#16a34a' : status === 'SOON' ? '#ea580c' : '#6b7280';

const ContactBoothCard = ({
  hostName,
  boothImage,
  location,
  remaining,
  capacity,
  status,
}: Props) => {
  const statusLabel =
    status === 'AVAILABLE' ? '여유' : status === 'SOON' ? '임박' : '만석';
  const progressPercent =
    capacity > 0 ? Math.min(100, (remaining / capacity) * 100) : 0;

  return (
    <Wrapper $isFull={status === 'FULL'}>
      <ImageBox>
        {boothImage ? (
          <BoothImage src={boothImage} alt={`${hostName} 이미지`} />
        ) : (
          <DefaultImg src={IMAGE_CONSTANTS.CHARACTERMINI} alt='기본이미지' />
        )}
      </ImageBox>

      <ContentArea>
        <NameRow>
          <BoothName>{hostName || '부스 이름 미정'}</BoothName>
          <LocationText>{location || '위치 미정'}</LocationText>
        </NameRow>

        <InfoArea>
          <NumberRow>
            <NumberDisplay>
              <RemainingNum $status={status}>{Math.max(0, remaining)}</RemainingNum>
              <CapacityNum>/{capacity ?? 0}</CapacityNum>
            </NumberDisplay>
            <StatusBadge $status={status}>{statusLabel}</StatusBadge>
          </NumberRow>

          <ProgressBarBg>
            <ProgressBarFill $percent={progressPercent} $status={status} />
          </ProgressBarBg>
        </InfoArea>
      </ContentArea>
    </Wrapper>
  );
};

export default ContactBoothCard;

const Wrapper = styled.div<{ $isFull: boolean }>`
  display: flex;
  align-items: center;
  width: 91%;
  padding: 16px;
  box-sizing: border-box;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
  gap: 12px;
  flex-shrink: 0;
  opacity: ${({ $isFull }) => ($isFull ? 0.6 : 1)};
`;

const ImageBox = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background-color: ${({ theme }) => theme.colors.Gray01};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BoothImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const DefaultImg = styled.img`
  width: 44px;
  height: 44px;
  object-fit: contain;
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  min-width: 0;
`;

const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
`;

const BoothName = styled.span`
  font-family: 'SUIT', sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
  min-width: 0;
`;

const LocationText = styled.span`
  font-family: 'SUIT', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  white-space: nowrap;
  flex-shrink: 0;
`;

const InfoArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const NumberRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
`;

const NumberDisplay = styled.div`
  display: flex;
  align-items: baseline;
`;

const RemainingNum = styled.span<{ $status: Status }>`
  font-family: 'SUIT', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: ${({ $status }) => getStatusColor($status)};
  line-height: 1;
`;

const CapacityNum = styled.span`
  font-family: 'SUIT', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #6b7280;
  line-height: 1;
`;

const StatusBadge = styled.div<{ $status: Status }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1.5px solid ${({ $status }) => getStatusColor($status)};
  background: #ffffff;
  font-family: 'SUIT', sans-serif;
  font-size: 12px;
  font-weight: 800;
  color: ${({ $status }) => getStatusColor($status)};
  white-space: nowrap;
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
`;

const ProgressBarBg = styled.div`
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 100px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div<{ $percent: number; $status: Status }>`
  height: 6px;
  width: ${({ $percent }) => $percent}%;
  background: ${({ $status }) => getStatusColor($status)};
  border-radius: 100px;
`;
