import {
  Box,
  Flex,
  FormControl,
  FormErrorMessage,
  Text,
} from '@chakra-ui/react';
import { CopyIcon, CheckIcon } from '@chakra-ui/icons';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export interface AddressProps {
  /**
   * The address to display
   */
  value: string;
  /**
   * Whether the address can be copied or not
   */
  copiable?: boolean;
  /**
   * Shorten the address if it does not resolve to an ENS name
   */
  shortened?: boolean;
  /**
   * Set to true for ENS lookup
   */
  ens?: boolean;
}

/**
 * A component to display an address
 */
export const Address: React.FC<AddressProps> = ({
  value,
  copiable = false,
  shortened = false,
  ens = false,
}) => {
  const [error, setError] = useState<null | string>(null);
  const [copied, setCopied] = useState<boolean>(false);
  let feedbackTimeOut: ReturnType<typeof setTimeout>;
  let displayAddress: string = value || '';
  const [ensName, setEnsName] = useState<string | null | undefined>(null);
  const provider: ethers.providers.JsonRpcProvider =
    new ethers.providers.Web3Provider(window.ethereum, 'any');
  useEffect(() => {
    if (value.includes('.eth') || value === '' || value === 'Not connected')
      return;

    async function fetchEns() {
      if (ens == true && value) {
        try {
          const ensResponse = await provider?.lookupAddress(value);
          setEnsName(ensResponse);
          return;
        } catch (error) {
          return;
        }
      }
    }
    fetchEns();
  }, [value]);

  if (shortened && value) {
    if (value.includes('.eth') || value === '' || value === 'Not connected') {
      displayAddress = value;
    } else {
      displayAddress = `${value.substring(0, 4)}...${value.substring(
        value.length - 4
      )}`.toLowerCase();
    }
  }

  const handleClick = async (): Promise<void> => {
    if (copiable && value) {
      try {
        await navigator.clipboard.writeText(value);
        setError(null);
        setCopied(true);

        feedbackTimeOut = setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (error) {
        setError(error as string);
      }
    }
  };

  useEffect(() => {
    return () => clearTimeout(feedbackTimeOut);
  }, []);

  return (
    <FormControl isInvalid={!!error}>
      <Flex
        data-testid="address-container"
        alignItems="center"
        cursor={copiable ? 'pointer' : 'initial'}
        onClick={handleClick}
      >
        <Text>{ensName || displayAddress}</Text>
        {copiable && (
          <Box ml="auto">
            {copied ? (
              <CheckIcon color="green.500" />
            ) : (
              <CopyIcon color="gray.300" />
            )}
          </Box>
        )}
      </Flex>
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
};
