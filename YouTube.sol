pragma solidity ^0.4.8;

contract YouTube {

  // Public variables of the token
  string public name;
  string public symbol;
  uint8 public decimals;
  string public version = '0.1';

  uint totalSupply;

  // Owner of this contract
  address public owner;

  // Balances for each account
  mapping (address => uint256) public balanceOf;

  // Owner of account approves the transfer of an amount to another account
  mapping(address => mapping (address => uint256)) allowed;

  // Triggered when tokens are transferred.
  event TokenTransfer(address indexed from, address indexed to, uint256 value);

  // Triggered whenever approve(address _spender, uint256 _value) is called.
  event Approval(address indexed _owner, address indexed _spender, uint256 _value);

  // Triggered when new channel is created.
  event NewChannelAdded(string name, address owner);

  // Channel Object
  struct Channel {
    string title;
    string id;
    address channelOwner;
    uint subscriberCount;
    uint lastPayoutDate;
  }

  Channel[] channels;

  // Functions with this modifier can only be executed by the owner
  modifier onlyOwnder {
    if (msg.sender != owner) {
      throw;
    } else {
      _;
    }
  }

  // Delete / kill the contract... only the owner has rights to do this
  function kill() onlyOwnder {
    suicide(owner);
  }

  // Constructor
  // @notice Create a YouTube Token - The Main Contract
  // @param coinName The token name
  // @param tokenSymbol The token symbol
  // @param initalToken The initial token value or totalSupply
  // @return the transaction address
  function YouTube(string coinName, string tokenSymbol, uint initalToken) {
    name = coinName;
    symbol = tokenSymbol;
    decimals = 2;
    owner = msg.sender;
    balanceOf[msg.sender] = initalToken;

    totalSupply = initalToken;
  }

  // @notice Add a new channel in the channels array
  // @param _title The title of the channel used in youtube
  // @param _id The channel id used in youtube
  // @param _owner The channel owner blockchin address
  // @param _subscribers The total subscribers for the channel
  // @return the transaction address and send the event as NewChannelAdded and TokenTransfer only when subscribers count is more than 0
  function addNewChannel(string _title, string _id, address _owner, uint _subscribers) onlyOwnder{
    uint nowTime = now * 1000;
    channels.push(Channel({
      title : _title,
      id : _id,
      channelOwner : _owner,
      subscriberCount : _subscribers,
      lastPayoutDate : nowTime
      }));

      NewChannelAdded(_title, _owner);

      if (_subscribers > 0) {
        transferToken(_owner, _subscribers);
      }
  }

  // @notice calculate and update the token for the selected channel
  // @param index The index of channel in the channels array
  // @param _subscribers The total subscribers for the channel
  // @return the transaction address and send the event as TokenTransfer only when additionalSubscribers is more than 0
  function calculateAndTransferToken(uint index, uint _subscribers) onlyOwnder {
    uint nowTime = now * 1000;
    uint additionalSubscribers = _subscribers - channels[index].subscriberCount;
    channels[index].subscriberCount = _subscribers;
    channels[index].lastPayoutDate = nowTime;
    if (additionalSubscribers > 0) {
      transferToken(channels[index].channelOwner, additionalSubscribers);
    }
  }

  // @notice send `_value` token to `_to` from `msg.sender`
  // @param _to The address of the recipient
  // @param _value The amount of token to be transferred
  // @return the transaction address and send the event as TokenTransfer
  function transferToken(address _to, uint256 _value) onlyOwnder {
      if (balanceOf[msg.sender] < _value) throw;
      if (balanceOf[_to] + _value < balanceOf[_to]) throw;
      balanceOf[msg.sender] -= _value;
      balanceOf[_to] += _value;
      TokenTransfer(msg.sender, _to, _value);
  }

  // What is the balance of a particular account?
  // @param who The address of the particular account
  // @return the balanace the particular account
  function balanceOf(address who) constant returns (uint256 balance) {
    return balanceOf[who];
  }

  // Allow _spender to withdraw from your account, multiple times, up to the _value amount.
  // If this function is called again it overwrites the current allowance with _value.
  // @param _spender The address of the sender
  // @param _amount The amount to be approved
  // @return the success tatus once the Approval progress is completed
  function approve(address _spender, uint256 _amount) returns (bool success) {
    allowed[msg.sender][_spender] = _amount;
    Approval(msg.sender, _spender, _amount);
    return true;
  }

  // Check the allowed value for the spender to withdraw from owner
  // @param _owner The address of the owner
  // @param _spender The address of the spender
  // @return the amount which _spender is still allowed to withdraw from _owner
  function allowance(address _owner, address _spender) constant returns (uint256 remaining) {
    return allowed[_owner][_spender];
  }

  // @return total amount of tokens
  function getTotalSupply() constant returns (uint) {
    return totalSupply;
  }

  // @return total channels available in the contract
  function getChannelsCount() public constant returns (uint) {
		return channels.length;
	}

  // @param index The index in which the channel detail will be retrieved from the channels array
  // @return a particual channel detail
  function getChannel(uint index) public constant returns(string, string, address, uint, uint, uint256) {
    return (channels[index].title, channels[index].id, channels[index].channelOwner, channels[index].subscriberCount, channels[index].lastPayoutDate, balanceOf[channels[index].channelOwner]);
  }
}
