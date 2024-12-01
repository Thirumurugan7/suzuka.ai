module addr::meme {
    use std::string::{Self, String};
    use aptos_framework::coin;
    use aptos_framework::managed_coin;
    use std::signer;
    
    /// Error codes
    const ENO_CAPABILITIES: u64 = 1;
    const EEXCEEDS_SUPPLY_LIMIT: u64 = 2;
    
    struct MoonCoin {}
    
    /// Stores the coin supply information and token details
    struct TokenInfo has key {
        name: vector<u8>,
        symbol: vector<u8>,
        decimals: u8,
        max_supply: u64,
        current_supply: u64,
    }
    
    /// Initialize token with user-defined parameters
    public entry fun initialize_token(
        account: &signer,
        name: vector<u8>,
        symbol: vector<u8>,
        decimals: u8,
        max_supply: u64
    ) {
        // Initialize the basic coin with dynamic values
        managed_coin::initialize<MoonCoin>(
            account,
            name,
            symbol,
            decimals,
            false,
        );
        
        move_to(account, TokenInfo {
            name,
            symbol,
            decimals,
            max_supply,
            current_supply: 0
        });
    }
    
    /// Register capability to receive the coin
    public entry fun register(account: &signer) {
        managed_coin::register<MoonCoin>(account);
    }
    
    /// Mint new tokens if within supply limit
    public entry fun mint(account: &signer, dst_addr: address, amount: u64) acquires TokenInfo {
        let token_info = borrow_global_mut<TokenInfo>(signer::address_of(account));
        
        // Check if minting would exceed supply limit
        assert!(token_info.current_supply + amount <= token_info.max_supply, EEXCEEDS_SUPPLY_LIMIT);
        
        managed_coin::mint<MoonCoin>(account, dst_addr, amount);
        token_info.current_supply = token_info.current_supply + amount;
    }
    
    /// Burn tokens and update supply
    public entry fun burn(account: &signer, amount: u64) acquires TokenInfo {
        let token_info = borrow_global_mut<TokenInfo>(signer::address_of(account));
        managed_coin::burn<MoonCoin>(account, amount);
        token_info.current_supply = token_info.current_supply - amount;
    }
    
    /// Transfer tokens between addresses
    public entry fun transfer(from: &signer, to: address, amount: u64) {
        coin::transfer<MoonCoin>(from, to, amount);
    }
    
    #[view]
    public fun get_token_info(account_addr: address): (String, String, u64, u64, u8, u64) acquires TokenInfo {
        let token_info = borrow_global<TokenInfo>(account_addr);
        
        (
            string::utf8(token_info.name),
            string::utf8(token_info.symbol),
            token_info.current_supply,
            token_info.max_supply - token_info.current_supply,
            token_info.decimals,
            token_info.max_supply
        )
    }
}