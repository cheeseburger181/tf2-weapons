package domain

type Item struct {
	Assets              []Asset       `json:"assets"`
	Descriptions        []Description `json:"descriptions"`
	TotalInventoryCount int           `json:"total_inventory_count"`
	Success             int           `json:"success"`
	Rwgrsn              int           `json:"rwgrsn"`
}

type Asset struct {
	Appid      int    `json:"appid"`
	ContextId  string `json:"contextid"`
	AssetId    string `json:"assetid"`
	ClassId    string `json:"classid"`
	InstanceId string `json:"instanceid"`
	Amount     string `json:"amount"`
}

type Description struct {
	Appid           int    `json:"appid"`
	ClassId         string `json:"classid"`
	InstanceId      string `json:"instanceid"`
	Currency        int    `json:"currency"`
	BackgroundColor string `json:"background_color"`
	IconUrl         string `json:"icon_url"`
	IconUrlLarge    string `json:"icon_url_large"`
	Descriptions    []struct {
		Value string `json:"value"`
		Color string `json:"color,omitempty"`
	} `json:"descriptions,omitempty"`
	Tradable int `json:"tradable"`
	Actions  []struct {
		Link string `json:"link"`
		Name string `json:"name"`
	} `json:"actions"`
	Name           string `json:"name"`
	NameColor      string `json:"name_color"`
	Type           string `json:"type"`
	MarketName     string `json:"market_name"`
	MarketHashName string `json:"market_hash_name"`
	MarketActions  []struct {
		Link string `json:"link"`
		Name string `json:"name"`
	} `json:"market_actions,omitempty"`
	Commodity                   int `json:"commodity"`
	MarketTradableRestriction   int `json:"market_tradable_restriction"`
	MarketMarketableRestriction int `json:"market_marketable_restriction"`
	Marketable                  int `json:"marketable"`
	Tags                        []struct {
		Category              string `json:"category"`
		InternalName          string `json:"internal_name"`
		LocalizedCategoryName string `json:"localized_category_name"`
		LocalizedTagName      string `json:"localized_tag_name"`
		Color                 string `json:"color,omitempty"`
	} `json:"tags"`
}
