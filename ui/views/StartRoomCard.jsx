import React from 'react';

export default function StartRoomCard({
    roomInfo,
  }) {
    const roomId = roomInfo?.roomId ?? 'unknown-room';
    const topic = roomInfo?.topic ?? '';
    const userCount = roomInfo?.userCount ?? -1;
    // todo: display list of users, or first few of them as names or avatars?
    //const userInfo = roomInfo?userInfo ?? new [];

    return (
        <div>
            <div 
                className="human-radius p-1 relative flex justify-center">
                {roomId}
            </div>
            <div 
                className="human-radius p-1 relative flex justify-center">
                {topic}
            </div>
            <div 
                className="human-radius p-1 relative flex justify-center">
                {userCount}
            </div>
        </div>
    );
}
  