import React from 'react';
import { compose, branch, renderNothing } from 'recompose';
import { Flex } from 'rebass';

import Avatar from 'src/components/Avatar/Avatar';
import UserInfo from 'src/components/UserInfo/UserInfo';
import RepositoriesList from 'src/components/RepositoriesList/RepositoriesList';
import withRequest from 'src/utils/withRequest';
import { fetchUser } from 'src/utils/api';

type Props = {
    fetchUserInfo: (username: string) => void,
    data: Object,
};

function AllUserInfo({ data }: Props) {
    return(
        <Flex justifyContent='center'>
            <Avatar avatarURL={data.avatar_url} />
            <Flex flexDirection='column'>
                <UserInfo
                    username={data.name}
                    location={data.location}
                    createdAt={new Date(data.created_at).toLocaleDateString()}
                />
                <RepositoriesList username={data.login} />
            </Flex>
        </Flex>
    );
}

const enhance = compose(
    withRequest(({ username }) => fetchUser(username)),
    branch(({ isLoading }) => isLoading, renderNothing),
);

export default enhance(AllUserInfo);