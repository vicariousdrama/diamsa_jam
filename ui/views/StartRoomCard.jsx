import React from 'react';
import {useMqParser} from '../lib/tailwind-mqp';

export default function StartRoomCard({
    roomInfo,
  }) {
    let mqp = useMqParser();    
    const roomName = roomInfo?.room ?? 'unknown room';
    const description = roomInfo?.description ?? '';
    const userCount = roomInfo?.userCount ?? -1;
    //const userInfo = roomInfo?userInfo ?? new [];

    return (
        <div>
            <div 
                className="human-radius p-1 relative flex justify-center">
                {roomName}
            </div>
            <div 
                className="human-radius p-1 relative flex justify-center">
                {description}
            </div>
            <div 
                className="human-radius p-1 relative flex justify-center">
                {userCount}
            </div>
        </div>
    );
}
  