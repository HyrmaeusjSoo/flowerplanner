import React, { useState, useEffect } from 'react';

import villagersData from './data/villagers.json';
import itemsData from './data/items.json';
import styled, { css } from 'styled-components';

type VillagerName = keyof typeof villagersData;
type ItemName = keyof typeof itemsData;

const clothingTypes = [
  'accessories', 
  'bags', 
  'headwear', 
  'shoes', 
  'dresses', 
  'bottoms', 
  'socks', 
  'tops',
  // 'umbrellas',
  // 'music',
  // 'bugs',
  // 'fish',
  // 'floors',
  // 'wallpapers',
  // 'fossils',
  // 'rugs',
  // 'wall mounted',
  // 'misc',
  // 'housewares',
];

let ownVillagersCache: VillagerName[] = [];
const ownVillagersCacheKey = 'ownVillagersCache';
try {
  ownVillagersCache = JSON.parse(localStorage.getItem(ownVillagersCacheKey) || '[]');
} catch (_) {}

const FavChecker = () => {
  const [villagerNameQuery, setVillagerNameQuery] = useState('');
  const [itemNameQuery, setItemNameQuery] = useState('');
  const [ownVillagers, setOwnVillagers] = useState(ownVillagersCache);

  useEffect(() => {
    localStorage.setItem(ownVillagersCacheKey, JSON.stringify(ownVillagers));
  }, [ownVillagers]);
  const onChangeVillagerName = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget) {
      setVillagerNameQuery(e.currentTarget.value);
    }
  };
  const onChangeItemName = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget) {
      setItemNameQuery(e.currentTarget.value);
    }
  };

  const villagerNames = Object.keys(villagersData) as VillagerName[];
  const itemNames = Object.keys(itemsData) as ItemName[];
  const filteredVillagerNames = villagerNames.filter((name) => {
    return ownVillagers.indexOf(name) !== -1
      || name.toLowerCase().indexOf(villagerNameQuery.toLowerCase()) !== -1;
  }).sort((vA, vB) => {
    const vAi = ownVillagers.indexOf(vA);
    const vBi = ownVillagers.indexOf(vB);
    if (vAi === vBi) {
      return vA > vB ? 1 : -1;
    }
    if (vAi === -1) {
      return 1;
    }
    if (vBi === -1) {
      return -1;
    }
    return 0;
  });

  const filteredItemNames = itemNames.filter((name) => {
    return itemNameQuery !== ''
      && clothingTypes.indexOf(itemsData[name].type) !== -1
      && name.toLowerCase().indexOf(itemNameQuery.toLowerCase()) !== -1;
  }).sort();

  const setItemQueryTo = (iName: ItemName) => {
    return () => {
      setItemNameQuery(iName);
    };
  };

  const addVillagerToOwn = (vName: VillagerName) => {
    return () => {
      if (ownVillagers.indexOf(vName) === -1) {
        setOwnVillagers([
          ...ownVillagers,
          vName,
        ]);
      } else {
        setOwnVillagers(ownVillagers.filter(v => v !== vName));
      }
    };
  };

  return <MainContainer>
    <div>
      <input
        value={villagerNameQuery}
        onChange={onChangeVillagerName}
        placeholder={'Type villager name here'}
      />
    </div>
    <ItemSearcher>
      <input
        value={itemNameQuery}
        onChange={onChangeItemName}
        placeholder={'Type item name here'}
      />
      {filteredItemNames.length < 100 && <div>
        {filteredItemNames.map(iName => {
          return <div
            key={iName}
            onClick={setItemQueryTo(iName)}
          >
            {iName}
          </div>;
        })}
      </div>}
      {filteredItemNames.length >= 100 && <div>
        {filteredItemNames.length} results, keep typing
      </div>}
    </ItemSearcher>
    <div>
      {filteredVillagerNames.map(vName => {
        const vData = villagersData[vName];
        const isOwnedVillager = ownVillagers.indexOf(vName) !== -1;
        const shortListed = filteredVillagerNames.length <= 20;
        return <VillagerRow
          key={vName}
          onClick={addVillagerToOwn(vName)}
          isOwnedVillager={isOwnedVillager}
        >
          <div>
            {vName}
            <VillagerLikes>
              likes {vData.likes.join(', ')}
            </VillagerLikes>
          </div>
          {(isOwnedVillager || shortListed) && filteredItemNames.length <= 10 && <div>
            {filteredItemNames.map(iName => {
              const itemData = itemsData[iName];
              return <ItemUnit key={iName}>
                {iName}
                {Object.entries(itemData.attributes).map(([attrKey, attrs]) => {
                  if (!attrs) {
                    return null;
                  }
                  const isFav = attrs.reduce((c, n) => {
                    return c || vData.likes.indexOf(n) !== -1;
                  }, false);
                  return <ItemVariant key={attrKey}>
                    {isFav ? <VariantYes/> : <VariantNo/>}
                    <span>
                      {attrKey}
                    </span>
                  </ItemVariant>;
                })}
              </ItemUnit>;
            })}
          </div>}
        </VillagerRow>;
      })}
    </div>
  </MainContainer>;
};

const MainContainer = styled.div`
  padding: 20px;
  input {
    border: none;
    border-radius: 4px;
    background: #fff;
    padding: 4px 8px;

    &:focus {
      outline: none;
    }
  }
`;

const ItemUnit = styled.div`
  margin: 0 8px 12px;;
`;
const ItemVariant = styled.div`
  margin-left: 10px;
  > span {
    vertical-align: middle;
  }
`;

const VillagerLikes = styled.div`
  margin-left: 10px;
`;

interface VillagerRowProps {
  isOwnedVillager: boolean;
}
const VillagerRow = styled.div<VillagerRowProps>`
  white-space: nowrap;
  margin: 4px;
  padding: 10px;
  border-radius: 2px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.01);
  }

  ${({ isOwnedVillager }) => isOwnedVillager && css`
    background: rgba(255, 255, 255, 0.1);
    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  `}

  > div {
    display: inline-block;
    vertical-align: top;
  }
`;

const VariantCircle = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 10px;
  display: inline-block;
  vertical-align: middle;
  margin: 0 8px;
`;
const VariantYes = styled(VariantCircle)`
  background: #6f6;
`;
const VariantNo = styled(VariantCircle)`
  background: #f66;
`;

const ItemSearcher = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 8px;
  max-height: 95vh;
  overflow: auto;
`;

export default FavChecker;